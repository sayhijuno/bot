import { type ClientEvents, MessageFlags, MessageReferenceType } from "discord.js"
import type { SlashasaurusClient } from "slashasaurus"
import { chat } from "@/util/chat"
import { getOptionsFor } from "@/util/options"
import { getMessageHistory } from "@/util/replies"

type Message = ClientEvents["messageCreate"][0]

export default async function (client: SlashasaurusClient, message: Message) {
    if (message.author.bot) return

    const isJunoReply = await isReplyToJuno(client, message)
    if (!isJunoReply && !message.content.startsWith(`<@${client.user?.id}>`)) return

    const userOptions = await getOptionsFor(message.author.id)
    if (userOptions.ignored) return

    let content = message.content.replace(`<@${client.user?.id}>`, "").trim()
    if (!content) return

    const webSearch = content.includes("--web") || content.includes("--search")
    content = content.replace("--web", "").replace("--search", "").trim()

    try {
        const messageHistory = await getMessageHistory(client, message)
        
        await message.channel.sendTyping()
        let typingInterval = setInterval(() => message.channel.sendTyping().catch(() => {}), 10000)
        
        const response = await chat(content, messageHistory, message.author.id, webSearch)
        
        if (typingInterval) {
            clearInterval(typingInterval)
        } 

        if (typeof response === 'string') {
            return await message.reply({
                content: response,
                allowedMentions: { repliedUser: true, parse: [] }
            })
        }

        await message.reply({
            components: response,
            allowedMentions: { repliedUser: true, parse: [] },
            flags: MessageFlags.IsComponentsV2 | MessageFlags.SuppressEmbeds
        })
    } catch (error) {
        console.error("Error processing message:", error)
        await message.reply({
            content: "I encountered an error processing your message. Please try again later.",
            allowedMentions: { repliedUser: true, parse: [] }
        })
    }
}

async function isReplyToJuno(client: SlashasaurusClient, message: Message): Promise<boolean> {
    if (message.reference?.type !== MessageReferenceType.Default) {
        return false
    }

    try {
        const referenced = await message.fetchReference()
        return referenced.author.id === client.user?.id
    } catch (error) {
        console.error("Error fetching referenced message:", error)
        return false
    }
}
