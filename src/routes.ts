import { createPlaywrightRouter, Dataset, KeyValueStore } from "crawlee";
import { storage } from "./storage.js";

export const router = createPlaywrightRouter();

interface Movie {
  title: string;
  poster: string | undefined;
  date: string;
  tags: string;
}
router.addDefaultHandler(async ({ log, parseWithCheerio }) => {
  log.info(`enqueueing new URLs`);
  const $ = await parseWithCheerio();
  const newMoviesSection = $(".App .movie_n_fests_grid");

  const movies = newMoviesSection.find(".parent_poster_wrapper");

  if (!movies.length) {
    log.info("No movies found");
    return;
  }

  const moviesFound: Movie[] = [];

  movies.each((_i, movie) => {
    const movieDate = $(movie).find(".movie_card_new_label").text();
    const movieTitle = $(movie)
      .find(".responsive_font_movie_title")
      .text()
      .split("|")[0]
      .trim();
    const moviePoster = $(movie).find(".img-fluid").attr("src");
    const movieTags = $(movie).find(".time_poster").text().trim();

    const movieObj = {
      title: movieTitle,
      poster: moviePoster,
      date: movieDate,
      tags: movieTags,
    };

    moviesFound.push(movieObj);
  });

  moviesFound.forEach(async (movie) => {
    const movieHash = getHashFromMovieTitle(movie.title);
    const doesMovieExistInStore = await storage.getItem(movieHash);
    if (!doesMovieExistInStore) {
      await storage.setItem(movieHash, movie);
      await sendNotification(movie);
    }
  });
});

function getHashFromMovieTitle(title: string) {
  return title
    .split("")
    .reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }, 0)
    .toString(36);
}

async function sendNotification(movie: Movie) {
  const message = `New movie found: ${movie.title} - ${movie.date}`;
  await postToDiscord(`
      ## New Movie Found

      - **Title:** ${movie.title}
      - **Date:** ${movie.date}
      - **Tags:** ${movie.tags} 
      - [Poster](${movie.poster})
      - [Website](https://www.qfxcinemas.com/upcoming)
    `);
}

async function postToDiscord(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("DISCORD_WEBHOOK_URL not set");
    return;
  }

  const data = {
    content: message,
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("Message sent to Discord");
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}
