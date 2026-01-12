#!/bin/sh
set -e

# Ensure database directory exists
mkdir -p /app/server/prisma/server/prisma

# Run Prisma migrations
echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "ERROR: Migration failed. Please check the database and migration files."
  echo "The server will not start to prevent data corruption."
  exit 1
fi

# Start the server
echo "Starting server..."
exec node dist/index.js
