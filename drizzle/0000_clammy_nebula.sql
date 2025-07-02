CREATE TABLE "options" (
	"userid" text PRIMARY KEY NOT NULL,
	"ignored" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE VIEW "public"."ignored" AS (select "userid", "ignored" from "options" where "options"."ignored" = true);