//=> https://orm.drizzle.team/docs/column-types/pg
import { eq } from "drizzle-orm"
import { pgTable, pgView } from "drizzle-orm/pg-core"

export const options = pgTable("options", (t) => ({
    userid: t.text().primaryKey(),
    ignored: t.boolean().notNull().default(false)
}))

export const ignored = pgView("ignored").as((qb) => {
    return qb.select().from(options).where(eq(options.ignored, true))
})

export type Options = typeof options.$inferInsert
