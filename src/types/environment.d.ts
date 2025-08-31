declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "prod" | "dev"
            DB_URI: string
            TOKEN: string
        }
    }
}

export {}
