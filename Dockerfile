# syntax=docker/dockerfile:1
# One build of the whole workspace, two runnable targets: `api` and `web`.
# Both targets share the same build layers, so they take little extra disk space.

FROM node:22-bookworm-slim AS builder
LABEL org.opencontainers.image.source="https://github.com/eskandari-reza/langstudio"
ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CI=true
RUN corepack enable
WORKDIR /app
COPY . .
# pnpm version comes from "packageManager" in the root package.json
RUN pnpm install --frozen-lockfile

# Inlined into the browser bundle: the API is served on the same domain under /backend
ARG NEXT_PUBLIC_API_URL=/backend
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Placeholder values only for `next build`; they are NOT kept in the image.
# Packages are built in dependency order (db first, then api and web).
RUN DATABASE_URL="postgres://build:build@localhost:5432/build" \
    AUTH_SECRET="build-time-placeholder-not-used-at-runtime" \
    AUTH_URL="http://localhost:3000" \
    pnpm -r --if-present run build

# ───────── API ─────────
FROM builder AS api
ENV NODE_ENV=production PORT=3001
USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]

# ───────── Web ─────────
FROM builder AS web
ENV NODE_ENV=production PORT=3000
WORKDIR /app/apps/web
# Next may write its cache at run time
RUN mkdir -p .next/cache && chown -R node:node .next/cache
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
