import create$kernel from "moonsight";
import dotenv from "dotenv";
dotenv.config();
import path from "node:path";
import { knexdbinit } from "./models/db";

create$kernel(
  {
    host: "localhost",
    apiPath: path.resolve("./api"),
    apiMount: "api",
    autoBoot: true,
    //apiMiddlewares: path.resolve("./mids"),
    version: "0.0.1",
    port: 8080,
    logging: {
      format: "full",
      all: false,
      exception: true,
      http: true,
      networking: true,
      job: true,
      queue: true,
      app: {

      }
    },
  },
  [knexdbinit],
);

