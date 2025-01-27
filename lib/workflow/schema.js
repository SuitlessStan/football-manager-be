import Util from "../utils/index.js";

const PlayerSchema = {
  get properties() {
    return {
      id: { type: "integer" },
      name: { type: "string" },
      position: { type: "string", enum: ["Goalkeeper", "Defender", "Midfielder", "Attacker"] },
      price: { type: "number" },
      team_id: { type: "integer" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    };
  },

  get postPlayer() {
    return {
      $id: "/API.postPlayer",
      type: "object",
      properties: Util.pick(PlayerSchema.properties, "name", "position", "price", "team_id"),
      required: ["name", "position", "price", "team_id"],
    };
  },

  get patchPlayer() {
    return {
      $id: "/API.patchPlayer",
      type: "object",
      properties: Util.pick(PlayerSchema.properties, "name", "position", "price"),
      required: ["id"],
    };
  },

  get deletePlayer() {
    return {
      $id: "/API.deletePlayer",
      type: "object",
      properties: Util.pick(PlayerSchema.properties, "id"),
      required: ["id"],
    };
  },
};

const TeamSchema = {
  get properties() {
    return {
      id: { type: "integer" },
      user_id: { type: "integer" },
      budget: { type: "number" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    };
  },

  get postTeam() {
    return {
      $id: "/API.postTeam",
      type: "object",
      properties: Util.pick(TeamSchema.properties, "user_id", "budget"),
      required: ["user_id", "budget"],
    };
  },

  get deleteTeam() {
    return {
      $id: "/API.deleteTeam",
      type: "object",
      properties: Util.pick(TeamSchema.properties, "id"),
      required: ["id"],
    };
  },
};

const TransferSchema = {
  get properties() {
    return {
      id: { type: "integer" },
      player_id: { type: "integer" },
      asking_price: { type: "number" },
      is_sold: { type: "boolean" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    };
  },

  get postTransfer() {
    return {
      $id: "/API.postTransfer",
      type: "object",
      properties: Util.pick(TransferSchema.properties, "player_id", "asking_price"),
      required: ["player_id", "asking_price"],
    };
  },

  get deleteTransfer() {
    return {
      $id: "/API.deleteTransfer",
      type: "object",
      properties: Util.pick(TransferSchema.properties, "id"),
      required: ["id"],
    };
  },
};

const UserSchema = {
  get properties() {
    return {
      id: { type: "integer" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    };
  },

  get postUser() {
    return {
      $id: "/API.postUser",
      type: "object",
      properties: Util.pick(UserSchema.properties, "email", "password"),
      required: ["email", "password"],
    };
  },
};

export { PlayerSchema, TeamSchema, TransferSchema, UserSchema };
