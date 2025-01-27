import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import errors from "../utils/errors.js"
import Util from "../utils/index.js"

const tableName = "teams"

class Teams {
  constructor(params) {
    this.knex = params.knex
  }

  async getByUserId(userId) {
    const raw = this.knex.select().from(tableName).where({ user_id: userId }).toSQL()
    const result = await this.knex.raw(raw.sql, raw.bindings)

    if (result[0].length !== 1) {
      throw new Error(errors.TEAM_NOT_FOUND)
    }

    return result[0][0]
  }

  async post(team = {}) {
    const ajv = ajvFormats(new Ajv({ removeAdditional: true, allowUnionTypes: true }))
    const _validate = ajv.compile(TeamsSchema.post)
    const isValid = _validate(team)

    if (!isValid) {
      const error = new Error(errors.TEAM_VALIDATION_ERROR)
      error.statusCode = 400
      error.info = _validate.errors
      throw error
    }

    const [id] = await this.knex(tableName).insert({ ...team, budget: 5000000 })
    return { id, ...team, budget: 5000000 }
  }
}

const TeamsSchema = {
  get properties() {
    return {
      id: { type: "integer" },
      user_id: { type: "integer" },
      budget: { type: "number" },
      created_at: { type: "string", format: "date-time" }
    }
  },
  get post() {
    return {
      $id: "/Teams.post",
      type: "object",
      properties: Util.pick(TeamsSchema.properties, "user_id"),
      required: ["user_id"]
    }
  }
}

export { TeamsSchema, Teams }