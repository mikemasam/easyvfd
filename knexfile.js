// Update with your config settings.
const dotenv = require('dotenv'); 
dotenv.config();

const KnexConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host:process.env.DB_HOST,
      database:process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dateStrings: true
    },
    pool: { 
      min: 0, 
      max: 7,
      idleTimeoutMillis: 10000,
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'mysql2',
    connection: {
      host:process.env.DB_HOST,
      database:process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dateStrings: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

module.exports = KnexConfig;
