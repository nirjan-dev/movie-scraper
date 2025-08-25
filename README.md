# Crawlee + PlaywrightCrawler + TypeScript project

This template is a production ready boilerplate for developing with `PlaywrightCrawler`. Use this to bootstrap your projects using the most up-to-date code.

If you're looking for examples or want to learn more visit:

- [Documentation](https://crawlee.dev/js/api/playwright-crawler/class/PlaywrightCrawler)
- [Examples](https://crawlee.dev/js/docs/examples/playwright-crawler)

## Deployment

### Fly.io

This project is configured to be deployed on [Fly.io](https://fly.io/).

1.  **Install `flyctl`**: Follow the instructions on the [Fly.io documentation](https://fly.io/docs/hands-on/install-flyctl/) to install the `flyctl` command-line tool.

2.  **Login to Fly.io**:
    ```sh
    fly auth login
    ```

3.  **Launch the app**: This will create a `fly.toml` file with the configuration for your app.
    ```sh
    fly launch
    ```
    *Note: A `fly.toml` file is already included in this project. You may need to adjust the app name.*

4.  **Set secrets**: Environment variables are managed as secrets in Fly.io.
    ```sh
    fly secrets set DISCORD_WEBHOOK_URL="your_webhook_url" ENABLE_NOTIFICATIONS="true"
    ```

5.  **Deploy**:
    ```sh
    fly deploy
    ```

### Docker Compose

You can also run this project on your own server using Docker Compose.

1.  **Install Docker and Docker Compose**: Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your server.

2.  **Create an environment file**: Create a `.env` file in the root of the project. The `docker-compose.yml` file is configured to automatically load it.
    ```env
    DISCORD_WEBHOOK_URL=your_discord_webhook_url
    ENABLE_NOTIFICATIONS=true
    ```

3.  **Build and run the container**:
    ```sh
    docker-compose up --build -d
    ```

    The application will be available at `http://localhost:8088`. The `-d` flag runs the container in detached mode.