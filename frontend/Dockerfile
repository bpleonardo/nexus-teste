# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.13.0

# =========================
# Dependencies
# =========================
FROM node:${NODE_VERSION} AS deps

WORKDIR /usr/src/app

RUN corepack enable

RUN corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./

RUN --mount=type=cache,id=yarn-deps,target=/yarn-cache \
  yarn install \
  --frozen-lockfile \
  --cache-folder /yarn-cache


# =========================
# Builder
# =========================
FROM node:${NODE_VERSION} AS builder

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source
COPY . .

ENV NODE_ENV=production

# Cache Next.js build artifacts
RUN --mount=type=cache,id=next-cache,target=/usr/src/app/.next/cache \
  yarn build


# =========================
# Runtime
# =========================
FROM node:${NODE_VERSION}-slim AS runner

WORKDIR /usr/src/app

# Install static file server
RUN yarn global add serve@14.2.5

ENV NODE_ENV=production
ENV PORT=3000

# Static export output
COPY --chown=node:node --from=builder /usr/src/app/out ./out

# Run as non-root user
USER node

EXPOSE 3000

CMD ["serve", "-s", "out", "-l", "3000", "-n"]
