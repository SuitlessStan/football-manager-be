import Ajv from "ajv"
import ajvFormats from "ajv-formats"
import errors from "../utils/errors.js"
import Util from "../utils/index.js"

const tableName = "users"

class Users {
    constructor(params) {
        this.knex = params.knex
    }

    async getById(id) {
        const raw = this.knex.select().from(tableName).where({ id }).toSQL()
        const result = await this.knex.raw(raw.sql, raw.bindings)

        if (result[0].length !== 1) {
            throw new Error(errors.USER_NOT_FOUND)
        }

        return result[0][0]
    }

    async post(user = {}) {
        const ajv = ajvFormats(new Ajv({ removeAdditional: true, allowUnionTypes: true }))
        const _validate = ajv.compile(UsersSchema.post)
        const isValid = _validate(user)

        if (!isValid) {
            const error = new Error(errors.USER_VALIDATION_ERROR)
            error.statusCode = 400
            error.info = _validate.errors
            throw error
        }

        const existingUser = await this.knex("users").where({ email: user.email }).first()
        if (existingUser) {
            throw new Error("USER_ALREADY_EXISTS")
        }

        const [id] = await this.knex(tableName).insert(user)
        return { id, ...user }
    }
}

const UsersSchema = {
    get properties() {
        return {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 12 },
            created_at: { type: "string", format: "date-time" }
        }
    },
    get post() {
        return {
            $id: "/Users.post",
            type: "object",
            properties: Util.pick(UsersSchema.properties, "email", "password"),
            required: ["email", "password"]
        }
    }
}

export { UsersSchema, Users }