import { storage } from "../storage.js";

export function getHashFromMovieTitle(title: string) {
  return title
    .split("")
    .reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }, 0)
    .toString(36);
}

export function addMovieToStorage(movie: Movie) {
  const movieHash = getHashFromMovieTitle(movie.title);
  storage.setItem(movieHash, {
    ...movie,
    dateAdded: new Date().toISOString(),
  });
}

export async function isMovieInStorage(movie: Movie) {
  const movieHash = getHashFromMovieTitle(movie.title);
  return await storage.hasItem(movieHash);
}

export async function cleanupMoviesInStorage() {
  const cleanBeforeTime = new Date();
  cleanBeforeTime.setTime(cleanBeforeTime.getTime() - 1000 * 60 * 60 * 24 * 7);
  const movies = await getMoviesInStorage();

  const removedMovies: string[] = [];
  for (const movie of movies) {
    const movieDateAdded = new Date(movie.value.dateAdded);
    console.log(movieDateAdded, cleanBeforeTime);
    if (movieDateAdded < cleanBeforeTime) {
      await storage.removeItem(movie.key);
      removedMovies.push(movie.value.title);
    }
  }

  return removedMovies;
}

export interface Movie {
  title: string;
  poster: string | undefined;
  date: string;
  tags: string;
}
export interface MovieInStorage extends Movie {
  dateAdded: string;
}

export async function getMoviesInStorage() {
  const movieKeys = await storage.getKeys();
  const movies = await storage.getItems<MovieInStorage>(movieKeys);

  return movies;
}
