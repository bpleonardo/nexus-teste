# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.13.0

# =========================
# Dependencies
# =========================
FROM node:${NODE_VERSION} AS deps

WORKDIR /usr/src/app

RUN corepack enable \
  && corepack prepare yarn@1.22.22 --activate

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile


# =========================
# Builder
# =========================
FROM node:${NODE_VERSION} AS builder

ARG NEXT_PUBLIC_API_URL

WORKDIR /usr/src/app

RUN corepack enable \
  && corepack prepare yarn@1.22.22 --activate

COPY --from=deps /usr/src/app/node_modules ./node_modules

COPY . .

RUN yarn build

# =========================
# Runtime
# =========================
FROM node:${NODE_VERSION}-slim AS runner

WORKDIR /usr/src/app

RUN corepack enable \
  && corepack prepare yarn@1.22.22 --activate

ENV PORT=3000

RUN yarn global add serve@14.2.5

COPY --chown=node:node --from=builder /usr/src/app/out ./out

USER node

EXPOSE 3000

CMD ["serve", "out", "-l", "3000", "-n"]
