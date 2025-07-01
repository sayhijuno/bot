import { chat } from "@/util/chat"
import { getOptionsFor } from "@/util/options"
import { ApplicationCommandOptionType, type ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { SlashCommand } from "slashasaurus"

async function run(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("query", true)
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? false

    const userOptions = await getOptionsFor(interaction.user.id)

    if (userOptions.ignored) {
        interaction.reply({
            content: "You have opted out of Juno and cannot use this command.",
            flags: MessageFlags.Ephemeral
        })
        return
    }

    const response = await chat(query, [], interaction.user)

    interaction.reply({
        content: response,
        allowedMentions: { repliedUser: true, parse: [] },
        flags: +ephemeral * MessageFlags.Ephemeral // (true * Ephemeral === Ephemeral) and (false * Ephemeral === 0) !
    })
}

export default new SlashCommand(
    {
        name: "heyai",
        description: "Ask Juno anything!",
        contexts: [0, 1, 2],
        integrationTypes: [0, 1],
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "query",
                description: "Your prompt. Note: You cannot follow up with the model at this time.",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "ephemeral",
                description: "Would you like this response to be public?"
            }
        ] as const
    },
    { run }
)
