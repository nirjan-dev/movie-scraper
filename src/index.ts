import { Hono } from "hono";
import { crawler, startUrls } from "./main.js";
import { serve } from "@hono/node-server";

import "dotenv/config";

const app = new Hono();

app.get("/check-movies", async (c) => {
  try {
    await crawler.run(startUrls);

    return c.json({
      message: "Movies checked",
      status: "success",
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.log(error);
    return c.json({
      message: "Movies not checked",
      status: "error",
      time: new Date().toISOString(),
    });
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
  }
);

export default app;
