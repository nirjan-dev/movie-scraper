import { Hono } from "hono";
import { crawler, startUrls } from "./main.js";
import { serve } from "@hono/node-server";
import cron from 'node-cron'

import "dotenv/config";
import { cleanupMoviesInStorage, getMoviesInStorage } from "./lib/movie.js";

const { DISCORD_WEBHOOK_URL, ENABLE_NOTIFICATIONS, MOVIE_CHECK_CRON_SCHEDULE, MOVIE_CLEANUP_CRON_SCHEDULE } = process.env;

console.log(
  `Env config options:
  DISCORD_WEBHOOK_URL: ${DISCORD_WEBHOOK_URL}
  ENABLE_NOTIFICATIONS: ${ENABLE_NOTIFICATIONS}
  MOVIE_CHECK_CRON_SCHEDULE: ${MOVIE_CHECK_CRON_SCHEDULE}
  MOVIE_CLEANUP_CRON_SCHEDULE: ${MOVIE_CLEANUP_CRON_SCHEDULE}
  `
)

const app = new Hono();


app.get('/', async (c) => {
  return c.json({
    status: "success",
    statusCode: 200,
    endpoints: [
      {
        path: '/movies/check',
        description: "Check the site for new movies with the scrapper and send notifications if new movies found (not in storage)."
      },
      {
        path: '/movies',
        description: 'Get movies currently in storage.'
      },
      {
        path: '/movies/cleanup',
        description: 'Cleanup old movies from storage. Will delete movies that are no longer on the site but in storage'
      }
    ]
  })
})

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

if (MOVIE_CHECK_CRON_SCHEDULE){
  cron.schedule(MOVIE_CHECK_CRON_SCHEDULE, () => {
    console.log('checking movies...');
    crawler.run(startUrls).then(() => console.log('successfully checked movies')).catch(error => console.log(`error while checking movies ${JSON.stringify(error)}`))
  })
}

if (MOVIE_CLEANUP_CRON_SCHEDULE){
  cron.schedule(MOVIE_CLEANUP_CRON_SCHEDULE, () => {
    console.log('cleaning up movies...');
    cleanupMoviesInStorage().then(() => console.log('successfully cleaned up movies')).catch(error => console.log(`error while cleaning up movies ${JSON.stringify(error)}`))
  })
}

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
