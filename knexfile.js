// Update with your config settings.

require('dotenv').config();
module.exports = {
	development: {
	  	client: "sqlite3",
	  	useNullAsDefault: true,
	  	connection: {
			filename: "./data/users.db",
	  	},
	 	pool: {
			afterCreate: (conn, done) => {
		  	conn.run("PRAGMA foreign_keys = ON", done);
			},
	  	},
	},
	production: {
		client: "pg",
		connection: process.env.DATABASE_URL,
		ssl: { 
			rejectUnauthorized: false 
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tablename: "knex_migrations",
			directory: "./migrations",
		},
	},
};