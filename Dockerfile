FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

ARG APP_VERSION=0.1.0
ARG GIT_SHA=unknown

ENV NODE_ENV=production
ENV PORT=3000
ENV APP_VERSION=${APP_VERSION}
ENV GIT_SHA=${GIT_SHA}

WORKDIR /app

RUN mkdir -p /app/data \
  && chown -R node:node /app

COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/public ./public

USER node

EXPOSE 3000

CMD ["npm", "start"]
