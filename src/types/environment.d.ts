declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "prod" | "dev"
            PG_URI: string
            TOKEN: string
            OPENROUTER_API_KEY: string
            OPENROUTER_MODEL: string
            CLOUDFLARE_API_ID: string
            CLOUDFLARE_AIG_KEY: string
            OPENAI_BASE_URL: string
        }
    }
}

export {}
