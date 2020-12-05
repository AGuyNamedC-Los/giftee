// Update with your config settings.

module.exports = {
	development: {
		client: "sqlite3",
		connection: {
			filename: "./data/users.sqlite3",
		},
		useNullAsDefault: true
	},
	production: {
		client: "pg",
		connection: process.env.DATABASE_URL,
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