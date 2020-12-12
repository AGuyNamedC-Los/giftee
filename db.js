require('dotenv').config();
const {Pool, Client} = require("pg");
const dbENV = process.env.DB_ENVIRONMENT || "development";

const config = {
    development: {
        user: process.env.USER,
        password: process.env.PASSWORD,
        host: process.env.HOST,
        port: process.env.DB_PORT,
        database: process.env.DATABASE
    },
    production: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
    }
}

const db = new Pool(config[dbENV]);
module.exports = db;