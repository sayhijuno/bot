import { Hono } from "hono";

const transponder = new Hono();

transponder.get("/", (c) => c.text("Hello from Mars!"))

export { transponder }
