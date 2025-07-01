import type { AssistantMessage, UserMessage } from "@mistralai/mistralai/models/components"

type JunoPrompt = {prompt: string}
type JunoConversation = {conversation: string[]}

type JunoRequestBodyComplicated = {
    input: JunoPrompt | JunoConversation
}

export type ChatMessage = { role: "user"; content: string }
| { role: "assistant"; content: string }
