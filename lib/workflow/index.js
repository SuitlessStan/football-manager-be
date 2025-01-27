import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Users } from "../models/users.js";
import { Teams } from "../models/teams.js";
import { Players } from "../models/players.js";
import { Transfers } from "../models/transfers.js";
import { PlayerSchema, TeamSchema, TransferSchema, UserSchema } from "./schema.js";
import Ajv from "ajv";
import ajvFormats from "ajv-formats";


class AuthMiddleware {
  constructor(params) {
    this.knex = params.knex;
    this.jwtSecret = params.jwtSecret
  }

  authenticate() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: "Unauthorized: Missing token" });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, this.jwtSecret);

        const user = await this.knex("users").where({ id: decoded.id }).first();
        if (!user) {
          return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        req.loginUser = { id: user.id, email: user.email };
        next();
      } catch (err) {
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: "Invalid token" });
        }
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: "Token expired" });
        }
        console.error("Authentication error:", err.message);
        return res.status(401).json({ error: "Authentication failed" });
      }
    };
  }

  async loginOrRegister(req, res) {
    // const ajv = ajvFormats(new Ajv({ removeAdditional: true, allowUnionTypes: true }))
    // const _validate = ajv.compile(UserSchema.post)
    // const isValid = _validate(req.body)
    // if (!isValid) {
    //   return res.status(400).json({ error: "Validation error", details: validate.errors });
    // }

    const { email, password } = req.body;

    try {
      let user = await this.knex("users").where({ email }).first();
      if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [id] = await this.knex("users").insert({
          email,
          password: hashedPassword,
          created_at: new Date()
        });
        user = { id, email };
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        this.jwtSecret,
        { expiresIn: "24h" }
      );

      res.status(200).json({
        token,
        user: { id: user.id, email: user.email }
      });
    } catch (err) {
      console.error("Login/Register error:", err.message);
      res.status(500).json({ error: "An error occurred", details: err });
    }
  }
}

class TeamsMiddleware {
  constructor(params) {
    this.knex = params.knex;
    this.team = new Teams(params);
    this.players = new Players(params);
    this.ajv = ajvFormats(new Ajv({ allErrors: true, removeAdditional: true }));
  }

  async createTeam(req, res, next) {
    const { id: userId } = req.loginUser;

    const validate = this.ajv.compile(TeamSchema.postTeam);
    if (!validate({ user_id: userId, budget: 5000000 })) {
      return res.status(400).json({ error: "Validation error", details: validate.errors });
    }

    try {
      await this.team.createTeam(userId);
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "An error occurred", details: err });
    }
  }

  async ensureValidTeamSize(req, res, next) {
    const { teamId } = req.params;
    if (!teamId) {
      return res.status(400).json({ error: "missing teamId parameter" })
    }

    const playerCount = await this.knex("players").where({ team_id: teamId }).count();

    if (playerCount < 15 || playerCount > 25) {
      return res.status(400).json({ error: "Team size must be between 15 and 25 players" });
    }

    next();
  }
}

class TransfersMiddleware {
  constructor(params) {
    this.knex = params.knex;
    this.transfers = new Transfers(params);
    this.ajv = ajvFormats(new Ajv({ allErrors: true, removeAdditional: true }));
  }

  async addPlayerToTransferList(req, res, next) {
    const validate = this.ajv.compile(TransferSchema.postTransfer);
    if (!validate(req.body)) {
      return res.status(400).json({ error: "Validation error", details: validate.errors });
    }

    const { playerId, price } = req.body;
    try {
      await this.transfers.addPlayer(playerId, price);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to add player to transfer list", details: err });
    }
  }

  async buyPlayer(req, res, next) {
    const { playerId, buyerTeamId } = req.body;
    try {
      const player = await this.knex("players").where({ id: playerId }).first();
      const buyerTeam = await this.knex("teams").where({ id: buyerTeamId }).first();

      if (!player || !buyerTeam) {
        return res.status(404).json({ error: "Player or team not found" });
      }

      if (buyerTeam.budget < player.price) {
        return res.status(400).json({ error: "Insufficient budget" });
      }

      const result = await this.transfers.buyPlayer(playerId, buyerTeamId);
      if (!result) {
        return res.status(400).json({ error: "Transfer failed" });
      }

      await this.knex("teams")
        .where({ id: buyerTeamId })
        .update({ budget: buyerTeam.budget - player.price });

      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "An error occurred", details: err });
    }
  }
}

export { AuthMiddleware, TeamsMiddleware, TransfersMiddleware };
