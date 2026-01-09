FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/apimanager/ ./apps/apimanager/
COPY packages/ ./packages/

ARG VITE_API_URL
ARG VITE_APIMANAGER_URL
ARG VITE_DEBUG=false
ARG CACHE_BUST

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APIMANAGER_URL=${VITE_APIMANAGER_URL}
ENV VITE_DEBUG=${VITE_DEBUG}

RUN pnpm install --frozen-lockfile
RUN echo "Build: VITE_API_URL=${VITE_API_URL}, VITE_APIMANAGER_URL=${VITE_APIMANAGER_URL}, CACHE=${CACHE_BUST}" && \
    pnpm --filter apimanager build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/apimanager/node_modules ./apps/apimanager/node_modules
COPY --from=builder /app/apps/apimanager/dist ./apps/apimanager/dist
COPY --from=builder /app/apps/apimanager/server.mjs ./apps/apimanager/
COPY --from=builder /app/apps/apimanager/package.json ./apps/apimanager/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

WORKDIR /app/apps/apimanager

USER appuser

EXPOSE 3102
ENV PORT=3102
ENV HOST=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3102/ || exit 1

CMD ["node", "server.mjs"]
