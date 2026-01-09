FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/apimanager/ ./apps/apimanager/
COPY packages/ ./packages/

# Build-time arguments - these get embedded into the client bundle
ARG VITE_API_URL
ARG VITE_APIMANAGER_URL
ARG VITE_DEBUG=false

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APIMANAGER_URL=${VITE_APIMANAGER_URL}
ENV VITE_DEBUG=${VITE_DEBUG}

RUN pnpm install --frozen-lockfile
RUN pnpm --filter apimanager build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/apimanager/node_modules ./apps/apimanager/node_modules
COPY --from=builder /app/apps/apimanager/dist ./apps/apimanager/dist
COPY --from=builder /app/apps/apimanager/package.json ./apps/apimanager/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Runtime environment variables for SSR (TanStack Start server)
# Set via Dokploy Environment Variables:
# - VITE_API_URL: API server URL (e.g., https://api-staging.talos.run)
# - VITE_APIMANAGER_URL: Apimanager URL for cookies (e.g., https://apimanager-staging.talos.run)
# Optional:
# - VITE_DEBUG: Set to "true" for enhanced logging

WORKDIR /app/apps/apimanager
EXPOSE 3102
CMD ["node", "dist/server/server.js"]
