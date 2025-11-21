#!/bin/sh
set -e

# Ensure database directory exists
mkdir -p /app/server/prisma/server/prisma

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy || npx prisma migrate dev --name init

# Start the server
echo "Starting server..."
exec node dist/index.js

