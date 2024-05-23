import { Model } from "objection";
import Knex from "knex";

async function knexdbinit() {
  const knex = Knex({
    client: "mysql2",
    useNullAsDefault: true,
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dateStrings: true,
    },
  });
  Model.knex(knex);
}
export { knexdbinit };
