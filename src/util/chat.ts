import { time, timeEnd } from "node:console"
import { readFileSync } from "node:fs"
import { env } from "node:process"
import type { ChatMessage } from "@/types/api"
import type { User } from "discord.js"
import OpenAI from "openai"
import { JUNO_ERROR, JUNO_TOOL_CALL_RECURSION } from "./errors"
import { TOOL_REGISTRY, type ToolName, tools } from "./tools"

const client = new OpenAI({
    apiKey: env.OPENROUTER_API_KEY,
    baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_API_ID}/juno/openrouter`,
    //baseURL: "https://openrouter.ai/api/v1"
    defaultHeaders: {
        "cf-aig-authorization": `Bearer ${env.CLOUDFLARE_AIG_KEY}`
    }
})

let systemPrompt = readFileSync("./src/util/prompt.txt", { encoding: "utf-8" })
systemPrompt = systemPrompt.replaceAll("$DATE", new Date().toISOString().split("T")[0])

export async function chat(content: string, messageHistory: ChatMessage[], author: User) {
    time("juno")

    const customizedPrompt = systemPrompt.replaceAll("$DISCORD_MESSAGE_AUTHOR", author.username)

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: customizedPrompt },
        ...messageHistory,
        { role: "user", content }
    ]

    try {
        const maxIterations = 10
        let iterations = 0

        while (iterations < maxIterations) {
            const response = await client.chat.completions.create({
                model: env.OPENROUTER_MODEL,
                messages,
                tools
            }, {
                headers: {
                    "cf-aig-metadata": JSON.stringify({
                        author: author.id,
                    })
                }
            })

            const assistantMessage = response.choices[0]?.message
            if (!assistantMessage) {
                throw new Error("No response from LLM")
            }
            
            if (!assistantMessage.tool_calls?.length) {
                timeEnd("juno")
                return assistantMessage.content || JUNO_ERROR
            }

            messages.push({
                role: assistantMessage.role,
                content: assistantMessage.content,
                tool_calls: assistantMessage.tool_calls
            })

            console.log(`Processing ${assistantMessage.tool_calls.length} tool call(s)`)

            for (const toolCall of assistantMessage.tool_calls) {
                const name = toolCall.function.name as ToolName
                const result = await TOOL_REGISTRY[name](JSON.parse(toolCall.function.arguments))
                
                messages.push({
                    role: "tool",
                    content: result,
                    tool_call_id: toolCall.id
                })
            }

            iterations++
        }

        timeEnd("juno")
        console.warn(`Hit maximum iterations (${maxIterations}) in agentic loop`)
        return JUNO_TOOL_CALL_RECURSION

    } catch (error) {
        timeEnd("juno")
        console.error("Error in chat function:", error)
        return JUNO_ERROR
    }
}
