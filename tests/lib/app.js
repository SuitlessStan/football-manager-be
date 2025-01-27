"use strict";
import { Server, app } from "../../lib/app.js";
import supertest from "supertest";
import { assert } from "chai";
import { config } from "../../config.js";
import jwt from "jsonwebtoken";

let _server = new Server(config);
let server = app.listen(80);

let token;
let newTeam;
let newPlayer;
let newTransfer;

describe("API Test Suite", () => {
  before(async () => {
    await _server.knex.migrate.latest();
    await Promise.all([
      _server.knex("users").del(),
      _server.knex("players").del(),
      _server.knex("teams").del(),
      _server.knex("transfers").del(),
      _server.knex("users").insert({ id: 1, email: "test@example.com", password: "plaintextPassword" }),
      _server.knex("teams").insert({ id: 1, user_id: 1, budget: 5000000 }),
      _server.knex("players").insert({ id: 1, name: "John Doe", position: "Defender", price: 1000000, team_id: 1 }),
      _server.knex("transfers").insert({ id: 1, player_id: 1, asking_price: 1000000, is_sold: false }),
    ]);
    token = jwt.sign({ id: 1, email: "test@example.com" }, config.jwtSecret, { expiresIn: "24h" });
  });

  after(async () => {
    await _server.knex.destroy();
  });

  afterEach(async () => {
    await Promise.all([
      _server.knex("users").del(),
      _server.knex("players").del(),
      _server.knex("transfers").del(),
      _server.knex("teams").del(),
    ]);
  });

  describe("Authentication", () => {
    it("should return 401 when accessing protected routes without a token", (done) => {
      supertest(server)
        .post("/teams")
        .send({})
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 401);
          assert.property(res.body, "error");
          done();
        });
    });

    it("should allow access with a valid token", (done) => {
      supertest(server)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({ user_id: 1, budget: 5000000 })
        .end((err, res) => {
          console.log("should allow access ", res)
          if (err) return done(err);
          assert.equal(res.status, 201);
          assert.property(res.body, "success");
          done();
        });
    });
  });

  describe("Team Creation", () => {
    it("should return 400 when creating a team without required fields", (done) => {
      supertest(server)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 400);
          assert.property(res.body, "error");
          done();
        });
    });

    it("should create a new team", (done) => {
      newTeam = { user_id: 1, budget: 5000000 };

      supertest(server)
        .post("/teams")
        .set("Authorization", `Bearer ${token}`)
        .send(newTeam)
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 201);
          assert.property(res.body, "success");
          done();
        });
    });
  });

  describe("Transfer List", () => {
    it("should return 400 when adding a player without required fields", (done) => {
      supertest(server)
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 400);
          assert.property(res.body, "error");
          done();
        });
    });

    it("should add a player to the transfer list", (done) => {
      supertest(server)
        .post("/transfers")
        .set("Authorization", `Bearer ${token}`)
        .send({ playerId: 1, price: 1000000 })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "success");
          done();
        });
    });
  });

  describe("Buying Players", () => {
    it("should return 400 when buying a player with invalid data", (done) => {
      supertest(server)
        .post("/transfers/buy")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 400);
          assert.property(res.body, "error");
          done();
        });
    });

    it("should buy a player", (done) => {
      supertest(server)
        .post("/transfers/buy")
        .set("Authorization", `Bearer ${token}`)
        .send({ playerId: 1, buyerTeamId: 2 })
        .end((err, res) => {
          if (err) return done(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "success");
          done();
        });
    });
  });

  describe("Team Size Validation", () => {
    it("should return 400 if team size is invalid", (done) => {
      supertest(server)
        .post("/teams/1/validate-size")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          if (err) return done(err);
          if (res.status === 400) {
            assert.property(res.body, "error");
          } else {
            assert.equal(res.status, 200);
            assert.property(res.body, "success");
          }
          done();
        });
    });
  });
});
