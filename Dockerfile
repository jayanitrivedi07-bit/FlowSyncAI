# ─────────────────────────────────────────────────────────
# Stage 1: Build the React PWA Frontend
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ─────────────────────────────────────────────────────────
# Stage 2: Install Backend Dependencies
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS backend-deps
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────
# Stage 3: Runner (Lean final image)
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Non-root user for security compliance & GCR best practices
RUN addgroup -S flowsync && adduser -S flowsync -G flowsync
USER flowsync

# Copy backend dependencies and source
COPY --from=backend-deps /app/node_modules ./node_modules
COPY --chown=flowsync:flowsync backend/ ./

# Copy built frontend assets into a static directory called 'public' inside backend
# Ensure /app/public is used by Express to serve static files
COPY --from=frontend-builder --chown=flowsync:flowsync /app/dist ./public

# Cloud Run / GCR requires applications to listen on PORT 8080 by default
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080
CMD ["node", "server.js"]
