import { db } from "@/db/connection"
import { options } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function getOptionsFor(userid: string) {
    let [user] = await db
        .select()
        .from(options)
        .where(and(eq(options.userid, userid)))
    if (user === undefined) {
        [user] = await db.insert(options).values({ userid: userid }).returning()
    }

    return user
}
