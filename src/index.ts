import { Hono } from "hono";
import { crawler, startUrls } from "./main.js";
import { serve } from "@hono/node-server";

import "dotenv/config";
import { cleanupMoviesInStorage, getMoviesInStorage } from "./lib/movie.js";

const app = new Hono();

app.get("/movies/check", async (c) => {
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

app.get("/movies", async (c) => {
  try {
    const movies = await getMoviesInStorage();
    return c.json({
      message: "Movies found",
      status: "success",
      time: new Date().toISOString(),
      movies,
    });
  } catch (error) {
    console.log(error);
    return c.json({
      message: "Movies not found",
      status: "error",
      time: new Date().toISOString(),
    });
  }
});

app.get("/movies/cleanup", async (c) => {
  try {
    const removedMovies = await cleanupMoviesInStorage();
    return c.json({
      message: "Movies cleaned up",
      status: "success",
      time: new Date().toISOString(),
      removedMovies,
    });
  } catch (error) {
    console.log(error);
    return c.json({
      message: "Movies not cleaned up",
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
