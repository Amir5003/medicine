# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy shared module (imported as ../../shared/ from server sub-directories)
COPY shared/ ./shared/

# Install server production deps only
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=deps --chown=appuser:appgroup /app /app

EXPOSE 5001
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
