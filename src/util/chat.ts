import { env } from "node:process"
import { type BaseMessageOptions, ComponentType, SeparatorSpacingSize, type Snowflake } from "discord.js"
import type { ChatMessage } from "@/types/api"

export async function chat(
    content: string,
    messageHistory: ChatMessage[],
    author: Snowflake,
    webSearch: boolean = false
): Promise<BaseMessageOptions["components"] | string> {
    const response = await fetch(`${env.API_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.API_KEY}`,
        },
        body: JSON.stringify({
            content,
            messageHistory,
            options: {
                webSearch,
            },
            context: {
                authorId: author,
            }
        }),
    })

    if (!response.ok) {
        const error = await response.json() as any
        return (error?.message ?? error) || "Hmm... I think somethings wrong!."
    }

    const data = await response.json() as { success: boolean, response: string, options: {webSearch: boolean} }

    return [
        { type: ComponentType.TextDisplay, content: data.response },
        ...(data.options.webSearch ? [
            { type: ComponentType.Separator, divider: false, spacing: SeparatorSpacingSize.Small },
            { type: ComponentType.TextDisplay, content: "-# Juno is not responsible for web search content. Search powered by Exa." }
        ] : [])
    ]
}
