import { Transfers, TransfersSchema } from "../../../lib/models/transfers.js";
import knexLib from "knex";
import { assert } from "chai";
import knexConfig from "../../../knexfile.cjs";
import moment from "moment";

const knex = knexLib(knexConfig.test);

describe("Transfers Schema", () => {
  it("should match post schema method", () => {
    assert.deepEqual(TransfersSchema.post, {
      $id: "/Transfers.post",
      type: "object",
      properties: {
        player_id: { type: "integer" },
        asking_price: { type: "number" },
      },
      required: ["player_id", "asking_price"],
    });
  });
});

let newTransfer = {
  player_id: 1,
  asking_price: 1000000,
};
let mTransfer;
let _transferInsert;

describe("Transfer", () => {
  before(async () => {
    await knex.migrate.latest();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("users").truncate();
    await knex("teams").truncate();
    await knex("players").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
    await knex("users").insert({ email: "test@example.com", password: "hashedpassword" });
    await knex("teams").insert({ user_id: 1, budget: 5000000 });
    await knex("players").insert({
      name: "John Doe",
      position: "Defender",
      price: 500000,
      team_id: 1,
    });
    mTransfer = new Transfers({ knex });
  });

  afterEach(async () => {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("transfers").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  });

  after(async () => {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("players").truncate();
    await knex("teams").truncate();
    await knex("users").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
    await knex.destroy();
  });

  it("should add a player to the transfer list", async () => {
    const result = await mTransfer.post(newTransfer);
    _transferInsert = result;
    assert.isDefined(_transferInsert.id);
    assert.deepEqual(_transferInsert, {
      id: _transferInsert.id,
      ...newTransfer,
    });
  });

  it("should get all available transfers", async () => {
    await mTransfer.post(newTransfer);
    const result = await mTransfer.getAll();
    assert.isArray(result);
    assert.equal(result.length, 1);
    assert.equal(result[0].player_id, newTransfer.player_id);
  });

  it("should mark a transfer as sold", async () => {
    await mTransfer.post(newTransfer);
    const result = await mTransfer.markAsSold(_transferInsert.id);
    assert.isTrue(result);
  });

  it("should remove a player from the transfer list", async () => {
    await mTransfer.post(newTransfer);
    const result = await mTransfer.removeByPlayerId(newTransfer.player_id);
    assert.isTrue(result);
  });

  it("should validate missing required fields", async () => {
    const invalidTransfer = { ...newTransfer };
    delete invalidTransfer.player_id;
    try {
      await mTransfer.post(invalidTransfer);
    } catch (err) {
      assert.equal(err.message, "TRANSFER_VALIDATION_ERROR");
    }
  });
});