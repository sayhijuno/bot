import { getOptionsFor } from "@/util/options";
import type { ClientEvents, User } from "discord.js";
import type { SlashasaurusClient } from "slashasaurus";

type Message = ClientEvents["messageCreate"][0];

type JunoMessageContent = {
    user?: User;
};

export default async function (client: SlashasaurusClient, message: Message) {
    if (message.author.bot) return;

    if (!message.content.startsWith(`<@${client.user.id}>`)) return;

    const content = message.content.replace(`<@${client.user.id}>`, '').trim()
    const context = {} as JunoMessageContent
    
    if (content.includes("^?")) {
        if(message.reference?.messageId) {
            context.user = (await message.fetchReference()).author
        } else {
            // we can't use channel.lastMessage, because its the invoking message
            // however, we can fetch all of the messages and pick the second newest one
            // d.js counts "first" upwards from the chatbox, the first message is the command itself
            // we will grab the first two messages, and only access the second
            context.user = (await message.channel.messages.fetch()).first(2)[1].author
        }

        if (context.user) {
            const userOptions = await getOptionsFor(context.user.id)
            if(userOptions.ignored) {
                context.user = undefined
            }
        }
    }

    console.log(content)

    if(context.user) {
        message.reply(`What about ${context.user.username}?`)
    } 

} 
