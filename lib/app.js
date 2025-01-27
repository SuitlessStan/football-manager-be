"use strict"
import express from "express"
import { config } from "../config.js"
import Knex from "knex"
import { createRequire } from "module"
import { fileURLToPath } from "url"
import cors from "cors"
import morgan from "morgan"
import { AuthMiddleware, TeamsMiddleware, TransfersMiddleware } from "../lib/workflow/index.js";


const app = express()
app.use(express.json())

class Server {
    constructor(_config) {
        this.knex = Knex({
            client: "mysql2",
            connection: {
                host: config.mysql.host,
                user: config.mysql.user,
                password: config.mysql.password,
                database: config.mysql.database,
                port: config.mysql.port || 3306,
                ssl: config.mysql.ssl || false,
            },
            pool: { min: 0, max: 20 },
        })

        const authMiddleware = new AuthMiddleware({ knex: this.knex, jwtSecret: config.jwtSecret });
        const teamsMiddleware = new TeamsMiddleware({ knex: this.knex });
        const transfersMiddleware = new TransfersMiddleware({ knex: this.knex });

        app.use(cors())
        app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

        app.get("/v1/health", (req, res, next) => {
            res.status(200).send("OK")
            next()
        })

        app.post("/auth", (req, res) => {
            authMiddleware.loginOrRegister(req, res);
        });

        app.post("/teams", authMiddleware.authenticate(), (req, res) => {
            teamsMiddleware.createTeam(req, res);
        });

        app.post("/transfers", authMiddleware.authenticate(), (req, res) => {
            transfersMiddleware.addPlayerToTransferList(req, res);
        });

        app.post("/transfers/buy", authMiddleware.authenticate(), (req, res) => {
            transfersMiddleware.buyPlayer(req, res);
        });

        app.post("/teams/:teamId/validate-size", authMiddleware.authenticate(), (req, res) => {
            teamsMiddleware.ensureValidTeamSize(req, res);
        });

        app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send("Something broke!")
        })
    }
}

const require = createRequire(import.meta.url)
const scriptPath = require.resolve(process.argv[1])
const modulePath = fileURLToPath(import.meta.url)
if (scriptPath === modulePath) {
    let _server = new Server(config)
    console.log("Server starting...")

    const server = app.listen(config.port, () => {
        console.log(`Server listening on port: ${config.port}`)
    })
}

export { Server, app }
