import 'dotenv/config'
import type { Config } from "drizzle-kit"
import { env } from 'node:process';

if (env.DB_URI === undefined) {
    throw new Error("DB_URI is not defined");
}

console.log('DB_URI', env.DB_URI);

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    casing: "snake_case",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DB_URI,
    },
} satisfies Config;
