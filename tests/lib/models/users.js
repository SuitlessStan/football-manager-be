import { Users, UsersSchema } from "../../../lib/models/users.js";
import knexLib from "knex";
import { assert } from "chai";
import knexConfig from "../../../knexfile.cjs";

const knex = knexLib(knexConfig.test);

describe("Users Schema", () => {
  it("should match post schema method", () => {
    assert.deepEqual(UsersSchema.post, {
      $id: "/Users.post",
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 12 },
      },
      required: ["email", "password"],
    });
  });
});

let newUser = {
  email: "test@example.com",
  password: "securepassword",
};

let mUser;
let _insert1;

describe("User", () => {
  before(async () => {
    await knex.migrate.latest();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("users").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
    mUser = new Users({ knex });
  });

  afterEach(async () => {
    await knex.raw("SET FOREIGN_KEY_CHECKS = 0");
    await knex("users").truncate();
    await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  });

  after(async () => {
    await knex.destroy();
  });

  it("should insert a new user record into the database", async () => {
    const result = await mUser.post(newUser);
    _insert1 = result;
    assert.isDefined(_insert1.id);
    assert.deepEqual(_insert1, {
      id: _insert1.id,
      email: newUser.email,
      password: newUser.password,
    });
  });

  it("should get a user record from the database by ID", async () => {
    await mUser.post(newUser);
    const result = await mUser.getById(_insert1.id);
    assert.deepEqual(result, {
      id: _insert1.id,
      email: newUser.email,
      created_at: result.created_at,
      password: _insert1.password,
    });
  });

  it("should not insert a duplicate user into the database", async () => {
    await mUser.post(newUser);
    try {
      await mUser.post(newUser);
    } catch (err) {
      assert.equal(err.message, "USER_ALREADY_EXISTS");
    }
  });

  it("should validate missing required fields", async () => {
    const invalidUser = { ...newUser };
    delete invalidUser.email;
    try {
      await mUser.post(invalidUser);
    } catch (err) {
      assert.equal(err.message, "USER_VALIDATION_ERROR");
    }
  });
});