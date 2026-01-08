FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/www/package.json ./apps/www/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_SERVER_URL=http://localhost:3102
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
RUN pnpm --filter web build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/www/.output ./apps/www/.output
COPY --from=builder /app/apps/www/dist ./apps/www/dist
COPY --from=builder /app/apps/www/package.json ./apps/www/
COPY --from=builder /app/apps/www/vite.config.ts ./apps/www/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

WORKDIR /app/apps/www
EXPOSE 3104
CMD ["pnpm", "serve", "--", "--port", "3104"]
