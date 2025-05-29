import { createPlaywrightRouter, Dataset, KeyValueStore } from "crawlee";
import { addMovieToStorage, isMovieInStorage, Movie } from "./lib/movie.js";
import { sendNotification } from "./lib/notifications.js";

export const router = createPlaywrightRouter();

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
    const doesMovieExistInStore = await isMovieInStorage(movie);
    if (!doesMovieExistInStore) {
      await addMovieToStorage(movie);
      await sendNotification(movie);
      log.info("Movie added to storage " + movie.title);
    }
  });
});
