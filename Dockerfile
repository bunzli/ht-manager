# Stage 1: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --workspace server

# Copy server source
COPY server/tsconfig.json ./server/
COPY server/prisma ./server/prisma/
COPY server/src ./server/src/

# Generate Prisma client and build server
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

# Stage 2: Build client
FROM node:20-alpine AS client-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --workspace client

# Copy client source
COPY client/tsconfig.json ./client/
COPY client/vite.config.ts ./client/
COPY client/index.html ./client/
COPY client/src ./client/src/

# Build client
WORKDIR /app/client
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS production
RUN apk add --no-cache curl
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only
RUN npm ci --workspace server --omit=dev

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/prisma ./server/prisma

# Copy built client
COPY --from=client-builder /app/client/dist ./client/dist

# Generate Prisma client for production
WORKDIR /app/server
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Set working directory to server for runtime
WORKDIR /app/server

# Start server
CMD ["node", "dist/index.js"]

