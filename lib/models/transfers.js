import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import errors from "../utils/errors.js"
import Util from "../utils/index.js"
import moment from "moment-timezone"

const tableName = "transfers"

class Transfers {
  constructor(params) {
    this.knex = params.knex
  }

  async getAll() {
    const result = await this.knex(tableName)
      .join("players", `${tableName}.player_id`, "players.id")
      .select(
        `${tableName}.id`,
        `${tableName}.player_id`,
        `${tableName}.asking_price`,
        "players.name",
        "players.position",
        "players.price as original_price"
      )
      .where(`${tableName}.is_sold`, false);

    return result;
  }

  async post(transfer = {}) {
    const ajv = ajvFormats(new Ajv({ removeAdditional: true, allowUnionTypes: true }))
    const _validate = ajv.compile(TransfersSchema.post)
    const isValid = _validate(transfer)

    if (!isValid) {
      const error = new Error(errors.TRANSFER_VALIDATION_ERROR)
      error.statusCode = 400
      error.info = _validate.errors
      throw error
    }

    const [id] = await this.knex(tableName).insert(transfer)
    return { id, ...transfer }
  }

  async markAsSold(transferId) {
    const raw = this.knex.from(tableName).where({ id: transferId }).update({
      is_sold: true,
      sold_at: moment().format("YYYY-MM-DD HH:mm:ss")
    }).toSQL()

    const result = await this.knex.raw(raw.sql, raw.bindings)
    return result[0].affectedRows > 0
  }

  async removeByPlayerId(playerId) {
    const raw = this.knex.from(tableName).where({ player_id: playerId }).del().toSQL()
    const result = await this.knex.raw(raw.sql, raw.bindings)
    return result[0].affectedRows > 0
  }
}

const TransfersSchema = {
  get properties() {
    return {
      id: { type: "integer" },
      player_id: { type: "integer" },
      asking_price: { type: "number" },
      is_sold: { type: "boolean" },
      created_at: { type: "string", format: "date-time" },
      sold_at: { type: "string", format: "date-time" }
    }
  },
  get post() {
    return {
      $id: "/Transfers.post",
      type: "object",
      properties: Util.pick(TransfersSchema.properties, "player_id", "asking_price"),
      required: ["player_id", "asking_price"]
    }
  }
}

export { TransfersSchema, Transfers }