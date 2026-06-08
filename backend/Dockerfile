# syntax=docker/dockerfile:1.7

# =========================
# Builder
# =========================
FROM node:26 AS builder

WORKDIR /usr/src/app

RUN npm install -g yarn

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
FROM node:26 AS prod-deps

WORKDIR /usr/src/app

RUN npm install -g yarn

COPY package.json yarn.lock ./

RUN --mount=type=cache,id=yarn-prod,target=/yarn-cache \
  yarn install \
  --frozen-lockfile \
  --production=true \
  --cache-folder /yarn-cache


# =========================
# Runtime
# =========================
FROM node:26-slim AS runner

WORKDIR /usr/src/app

RUN npm install -g yarn

ENV NODE_ENV=production

COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=prod-deps /usr/src/app/package.json ./package.json

# Prisma runtime files
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts

# Application
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "yarn db:deploy && yarn start:prod"]
