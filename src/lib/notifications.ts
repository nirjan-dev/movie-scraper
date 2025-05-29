import { Movie } from "./movie.js";

export async function sendNotification(movie: Movie) {
  await postToDiscord(`
      ## New Movie Found

      - **Title:** ${movie.title}
      - **Date:** ${movie.date}
      - **Tags:** ${movie.tags} 
      - [Poster](${movie.poster})
      - [Website](https://www.qfxcinemas.com/upcoming)
    `);
}

export async function postToDiscord(message: string) {
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
    console.log("Message sent to Discord", message);
  } catch (error) {
    console.error("Error sending message to Discord:", error, message);
  }
}
