import { ApplicationCommandOptionType, type ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { SlashCommand } from "slashasaurus"
import { chat } from "@/util/chat"
import { getOptionsFor } from "@/util/options"

async function run(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("query", true)
    const ephemeral = interaction.options.getBoolean("ephemeral") ?? false
    const webSearch = interaction.options.getBoolean("web_search") ?? false

    const userOptions = await getOptionsFor(interaction.user.id)

    if (userOptions.ignored) {
        interaction.reply({
            content: "You have opted out of Juno and cannot use this command.",
            flags: MessageFlags.Ephemeral
        })
        return
    }

    await interaction.deferReply();

    const response = await chat(query, [], interaction.user.id, webSearch)

    if (typeof response === 'string') {
        await interaction.followUp({
            content: response,
            flags: MessageFlags.Ephemeral
        })
        return
    }
    
    interaction.followUp({
        components: response,
        allowedMentions: { repliedUser: true, parse: [] },
        flags: MessageFlags.IsComponentsV2 | MessageFlags.SuppressEmbeds | (+ephemeral * MessageFlags.Ephemeral) // yay
    })
}

export default new SlashCommand(
    {
        name: "heyjuno",
        description: "Ask Juno anything!",
        contexts: [0, 1, 2],
        integrationTypes: [0, 1],
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "query",
                description: "Your prompt! You cannot follow up when using the slash command.",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "ephemeral",
                description: "Would you like this response to be public?"
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "web_search",
                description: "Would you like to enable web search? This may affect response quality.",
            }
        ] as const
    },
    { run }
)
