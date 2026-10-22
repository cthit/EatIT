FROM node:26-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm@10.28.0
RUN pnpm i --frozen-lockfile

# Copy application files
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:26-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
