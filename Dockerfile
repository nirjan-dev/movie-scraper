# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22
FROM apify/actor-node-playwright-chrome:${NODE_VERSION} AS base

LABEL fly_launch_runtime="Node.js"
# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build


# Install node modules
COPY --chown=myuser package-lock.json package.json ./
RUN npm install --include=dev --audit=false

# Copy application code
COPY --chown=myuser . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --prod


# Final stage for app image
FROM base

# Copy built application
COPY --from=build --chown=myuser /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000

USER node

CMD [ "npm", "run", "start:prod" ]
