import type { ChatMessage } from "@/types/api"
import { type Message, MessageReferenceType } from "discord.js"
import type { SlashasaurusClient } from "slashasaurus"

export async function getMessageHistory(client: SlashasaurusClient, message: Message) {
    const history: ChatMessage[] = []
    let currentMessage = message
    let depth = 0
    const MAX_DEPTH = 10

    while (currentMessage.reference && depth < MAX_DEPTH) {
        try {
            const referencedMessage = await currentMessage.fetchReference()

            if (currentMessage.reference.type === MessageReferenceType.Default) {
                const role = referencedMessage.author.id === client.user?.id ? "assistant" : "user"
                const content = role === "user" ? referencedMessage.content.replace(`<@${client.user?.id}>`, "").trim() : referencedMessage.content

                // Skip if this message would be a duplicate of the previous one in the history
                const lastMessage = history.length > 0 ? history[0] : null;
                const isDuplicate = lastMessage && 
                                   lastMessage.role === role && 
                                   lastMessage.content === content;
                
                if (!isDuplicate) {
                    history.unshift({
                        role,
                        content
                    })
                }
            }

            currentMessage = referencedMessage
            depth++
        } catch (error) {
            console.error("Failed to fetch referenced message:", error)
            break
        }
    }

    return history
}
