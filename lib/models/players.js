import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import errors from "../utils/errors.js"
import Util from "../utils/index.js"
import moment from "moment-timezone"

const tableName = "players"

class Players {
  constructor(params) {
    this.knex = params.knex
  }

  async getByTeamId(teamId) {
    const raw = this.knex.select().from(tableName).where({ team_id: teamId }).toSQL()
    const result = await this.knex.raw(raw.sql, raw.bindings)
    return result[0]
  }

  async post(player = {}) {
    const ajv = ajvFormats(new Ajv({ removeAdditional: true, allowUnionTypes: true }))
    const _validate = ajv.compile(PlayersSchema.post)
    const isValid = _validate(player)

    if (!isValid) {
      const error = new Error(errors.PLAYER_VALIDATION_ERROR)
      error.statusCode = 400
      error.info = _validate.errors
      throw error
    }

    const [id] = await this.knex(tableName).insert(player)
    return { id, ...player, created_at: moment().format("YYYY-MM-DD HH:mm:ss") }
  }
}

const PlayersSchema = {
  get properties() {
    return {
      id: { type: "integer" },
      team_id: { type: "integer" },
      name: { type: "string" },
      position: { type: "string", enum: ["Goalkeeper", "Defender", "Midfielder", "Attacker"] },
      price: { type: "number" },
      created_at: { type: "string", format: "date-time" }
    }
  },
  get post() {
    return {
      $id: "/Players.post",
      type: "object",
      properties: Util.pick(PlayersSchema.properties, "name", "position", "price", "team_id", "created_at", "id"),
      required: ["name", "price", "position"]
    }
  }
}

export { PlayersSchema, Players }