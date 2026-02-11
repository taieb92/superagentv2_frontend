# ==========================
# Base stage (shared)
# ==========================
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV TZ="UTC"
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

# ==========================
# Dependencies stage
# ==========================
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# ==========================
# Builder stage
# ==========================
FROM base AS builder
WORKDIR /app

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL


ARG NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL

ARG NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ==========================
# Runner / production stage
# ==========================
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set runtime environment
ENV PORT=3000
ENV HOST=0.0.0.0

# Start Next.js
CMD ["node", "server.js"]