import { ApplicationCommandOptionType, MessageFlags, type ChatInputCommandInteraction } from "discord.js"
import { SlashCommand } from "slashasaurus"

function run(interaction: ChatInputCommandInteraction) {
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? true

    interaction.reply({
        content: "Pong!",
        flags: +ephemeral * MessageFlags.Ephemeral
    })
}

export default new SlashCommand(
    {
        name: "ping",
        description: "Pings the bot to make sure everything is working",
        options: [
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "ephemeral",
                description: "Would you like this response to be private?"
            }
        ] as const
    },
    {
        run: run
    }
)
