import 'dotenv/config'
import type { Config } from "drizzle-kit"
import { env } from 'node:process';

if (env.PG_URI === undefined) {
    throw new Error("DATABASE_URL is not defined");
}

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    casing: "snake_case",
    dialect: "postgresql",
    dbCredentials: {
        url: env.PG_URI,
    },
} satisfies Config;
