import { db } from "@/db/connection"
import { options } from "@/db/schema"
import { ApplicationCommandOptionType, MessageFlags, type ChatInputCommandInteraction } from "discord.js"
import { SlashCommand } from "slashasaurus"

async function run(interaction: ChatInputCommandInteraction) {
    const value = interaction.options.getBoolean("ignore", true)

    await db
        .insert(options)
        .values({
            userid: interaction.user.id,
            ignored: value
        })
        .onConflictDoUpdate({
            target: options.userid,
            set: { ignored: value }
        })

    interaction.reply({
        content: `I will now ${value ? "ignore" : "unignore"} you!\n\n-# Juno will no longer allow users to use your messages in iteractions and you will no longer be able to use Juno.`,
        flags: MessageFlags.Ephemeral
    })
}

export default new SlashCommand(
    {
        name: "ignore",
        description: "Opt out of being processed by Juno - you will be fully ignored and impossible to interact with.",
        options: [
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "ignore",
                description: "Should Juno ignore you?",
                required: true
            }
        ] as const,
    },
    { run }
)
