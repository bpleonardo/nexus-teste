# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.13.0

# =========================
# Builder
# =========================
FROM node:${NODE_VERSION} AS builder

WORKDIR /usr/src/app


RUN corepack enable

RUN corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./

RUN --mount=type=cache,id=yarn-builder,target=/yarn-cache \
  yarn install \
  --frozen-lockfile \
  --cache-folder /yarn-cache

# Copy Prisma schema only
COPY prisma ./prisma

# Generate Prisma client before TypeScript build
RUN yarn prisma generate

# Copy application source
COPY tsconfig*.json nest-cli.json ./
COPY prisma.config.ts ./
COPY src ./src

# Build NestJS
RUN yarn build


# =========================
# Production dependencies
# =========================
FROM node:${NODE_VERSION} AS prod-deps

WORKDIR /usr/src/app

RUN corepack enable

RUN corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./

RUN --mount=type=cache,id=yarn-prod,target=/yarn-cache \
  yarn install \
  --frozen-lockfile \
  --production=true \
  --cache-folder /yarn-cache


# =========================
# Runtime
# =========================
FROM node:${NODE_VERSION}-slim AS runner

WORKDIR /usr/src/app

RUN corepack enable

RUN corepack prepare yarn@1.22.22 --activate

ENV NODE_ENV=production

COPY --chown=node:node --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=prod-deps /usr/src/app/package.json ./package.json

# Prisma runtime files
COPY --chown=node:node --from=builder /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts

# Application
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["sh", "-c", "yarn db:deploy && yarn start:prod"]
