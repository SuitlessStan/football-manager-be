import { Players, PlayersSchema } from "../../../lib/models/players.js";
import knexLib from "knex";
import { assert } from "chai";
import knexConfig from "../../../knexfile.cjs";
import moment from "moment-timezone"

const knex = knexLib(knexConfig.test);

describe("Player Schema", () => {
  it("should match post schema method", () => {
    assert.deepEqual(PlayersSchema.post, {
      $id: "/Players.post",
      type: "object",
      properties: {
        id: { type: "integer" },
        team_id: { type: "integer" },
        name: { type: "string" },
        position: { type: "string", enum: ["Goalkeeper", "Defender", "Midfielder", "Attacker"] },
        price: { type: "number" },
        created_at: { type: "string", format: "date-time" },
      },
      required: ["name", "price", "position"],
    });
  });
});

let newPlayer = {
  name: "John Doe",
  position: "Defender",
  price: 5000000,
  team_id: 1,
};
let mPlayer;
let _playerInsert;

describe("Player", () => {
  before(async () => {
    await knex.migrate.latest();
    await knex("users").insert({ email: "test@example.com", password: "hashedpassword" });
    await knex("teams").insert({ user_id: 1, budget: 5000000 });
    mPlayer = new Players({ knex });
  });

  afterEach(async () => {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("players").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  });

  after(async () => {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("teams").truncate();
    await knex("users").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
    await knex.destroy();
  });

  it("should insert a new player record into the database", async () => {
    const result = await mPlayer.post(newPlayer);
    delete result.created_at
    _playerInsert = result;
    assert.isDefined(_playerInsert.id);
    assert.deepEqual(_playerInsert, {
      id: _playerInsert.id,
      ...newPlayer,
    });
  });

  it("should get players by team ID", async () => {
    await mPlayer.post(newPlayer);
    const result = await mPlayer.getByTeamId(newPlayer.team_id);
    assert.equal(result.length, 1);
    delete result[0].created_at
    result[0].price = parseFloat(result[0].price)
    assert.deepEqual(result[0], {
      id: _playerInsert.id,
      name: _playerInsert.name,
      position: _playerInsert.position,
      price: parseFloat(`${_playerInsert.price}`),
      team_id: _playerInsert.team_id,
    });
  });

  it("should validate missing required fields", async () => {
    const invalidPlayer = { ...newPlayer };
    delete invalidPlayer.name;
    try {
      await mPlayer.post(invalidPlayer);
    } catch (err) {
      assert.equal(err.message, "PLAYER_VALIDATION_ERROR");
    }
  });
});