import { ActionRow, ActionRowData, APIActionRowComponent, APIComponentInMessageActionRow, APIMessageTopLevelComponent, ComponentType, type Message, MessageReferenceType, TextDisplayComponent } from "discord.js"
import type { SlashasaurusClient } from "slashasaurus"
import type { ChatMessage } from "@/types/api"

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
                let content: string;
                
                if (role === "user") {
                    content = referencedMessage.content.replace(`<@${client.user?.id}>`, "").trim()
                } else {
                    // For assistant messages (current application), extract from first text component
                    // Juno always sends the main response as the first TextDisplay in the first ActionRow
                    const actionRow = referencedMessage.components[0] as TextDisplayComponent
                    content = actionRow.content
                }

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

    console.log(history)
    return history
}
