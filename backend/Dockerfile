# ─────────────────────────────────────────────────────────
# Stage 1 — deps (install only production dependencies)
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────
# Stage 2 — runner (lean final image)
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup -S flowsync && adduser -S flowsync -G flowsync
USER flowsync

# Copy only prod node_modules + source
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=flowsync:flowsync . .

# Cloud Run requires PORT 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
