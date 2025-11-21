# Stage 1: Build server
FROM node:20-alpine AS server-builder
WORKDIR /app

# Copy package files (needed for workspaces)
COPY package*.json ./
COPY server/package*.json ./server/

# Install all dependencies (workspaces need root install)
RUN npm ci

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

# Copy all package files (needed for workspaces)
COPY package*.json ./
COPY client/package*.json ./client/

# Install all dependencies (workspaces need root install)
RUN npm ci

# Copy client source and config files
COPY client/tsconfig.json ./client/
COPY client/tsconfig.node.json ./client/
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

# Copy package files (needed for workspaces)
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only
# For workspaces, we need to install at root level
# Since we only copied server/package.json, npm will only install server workspace
RUN npm ci --omit=dev

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/prisma ./server/prisma

# Copy built client
COPY --from=client-builder /app/client/dist ./client/dist

# Install Prisma CLI globally for migrations
RUN npm install -g prisma@^6.17.1

# Generate Prisma client for production
WORKDIR /app/server
RUN npx prisma generate

# Copy startup script
COPY server/src/start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3000

# Set working directory to server for runtime
WORKDIR /app/server

# Start server with migration script
CMD ["./start.sh"]

