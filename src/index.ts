import { serve } from "@hono/node-server"
import { type ClientEvents, IntentsBitField, OAuth2Scopes } from "discord.js"
import "dotenv/config"
import { readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { version } from "package.json"
import { SlashasaurusClient } from "slashasaurus"
import { transponder } from "./server"
import { logger } from "./util/logger"

const client = new SlashasaurusClient(
    {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages
        ]
    },
    {
        logger: logger
    }
)

const d = dirname(fileURLToPath(import.meta.url))
const events = join(d, "events")
const commands = join(d, "commands")

for (const file of readdirSync(events)) {
    const event = (await import(join(events, file))).default
    const eventName = file.replace(/\.(js|ts)$/, '') as keyof ClientEvents

    client.on(eventName, async (...args) => event(client, ...args));
}

client.once("clientReady", async () => {
    client.registerCommandsFrom(commands, true, process.env.TOKEN)

    //client.registerGuildCommandsFrom(commands, "342506939340685312", true, process.env.TOKEN)

    logger.info(`Client ready and logged in as ${client.user?.tag}`)
    logger.info(`Invite me with ${client.generateInvite({ scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands] })}`)
})

client.login(process.env.TOKEN)

serve(
    {
        fetch: transponder.fetch,
        port: Number.parseInt(process.env.API_PORT ?? "3005"),
    },
    (addr) => {
        const bindAddr = `http://${addr.family === 'IPv6' ? `[${addr.address}]` : addr.address}`;

        console.log(`Juno Transponder Service ${version} - ${bindAddr}:${addr.port}`);
    },
);

export { client as JunoBot }
