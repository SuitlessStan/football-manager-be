import { Teams, TeamsSchema } from "../../../lib/models/teams.js";
import knexLib from "knex";
import { assert } from "chai";
import knexConfig from "../../../knexfile.cjs";

const knex = knexLib(knexConfig.test);

describe("Team Schema", () => {
  it("should match post schema method", () => {
    assert.deepEqual(TeamsSchema.post, {
      $id: "/Teams.post",
      type: "object",
      properties: {
        user_id: { type: "integer" },
      },
      required: ["user_id"],
    });
  });
});

let newTeam = { user_id: 1 };
let mTeam;
let _teamInsert;

describe("Team", () => {
  before(async () => {
    await knex.migrate.latest();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("users").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
    await knex("users").insert({ email: "test@example.com", password: "hashedpassword" });
    mTeam = new Teams({ knex });
  });

  afterEach(async () => {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("teams").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  });

  after(async () => {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("users").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
    await knex.destroy();
  });

  it("should insert a new team record into the database", async () => {
    const result = await mTeam.post(newTeam);
    _teamInsert = result;
    assert.isDefined(_teamInsert.id);
    assert.deepEqual(_teamInsert, {
      id: _teamInsert.id,
      user_id: newTeam.user_id,
      budget: 5000000,
    });
  });

  it("should get a team record by user ID", async () => {
    await mTeam.post(newTeam);
    const result = await mTeam.getByUserId(newTeam.user_id);
    delete result.created_at
    result.budget = parseFloat(result.budget)
    assert.deepEqual(result, {
      id: _teamInsert.id,
      user_id: _teamInsert.user_id,
      budget: _teamInsert.budget
    });
  });

  it("should validate missing required fields", async () => {
    const invalidTeam = { ...newTeam };
    delete invalidTeam.user_id;
    try {
      await mTeam.post(invalidTeam);
    } catch (err) {
      assert.equal(err.message, "TEAM_VALIDATION_ERROR");
    }
  });
});