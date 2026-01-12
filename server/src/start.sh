#!/bin/sh
set -e

# Ensure database directory exists
mkdir -p /app/server/prisma/server/prisma

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Display database path for debugging
echo "DATABASE_URL: $DATABASE_URL"
echo "Working directory: $(pwd)"

# Convert relative DATABASE_URL to absolute path for Prisma
# Prisma needs absolute paths for reliable migration tracking
DB_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')
if [ "$(echo "$DB_PATH" | cut -c1)" != "/" ]; then
  # Relative path - resolve it
  ABS_DB_PATH="$(pwd)/$DB_PATH"
  export DATABASE_URL="file:$ABS_DB_PATH"
  echo "Resolved DATABASE_URL to: $DATABASE_URL"
fi

# Run Prisma migrations
echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "ERROR: Migration failed. Please check the database and migration files."
  echo "The server will not start to prevent data corruption."
  exit 1
fi

# Verify critical tables exist (especially Match table)
echo "Verifying database schema..."
DB_FILE=$(echo "$DATABASE_URL" | sed 's|^file:||')
if [ -f "$DB_FILE" ]; then
  echo "Database file exists at: $DB_FILE"
  # Check if Match table exists
  if sqlite3 "$DB_FILE" "SELECT name FROM sqlite_master WHERE type='table' AND name='Match';" | grep -q "Match"; then
    echo "✓ Match table exists"
  else
    echo "ERROR: Match table does not exist after migration!"
    echo "This indicates a migration state mismatch."
    echo "You may need to manually fix the _prisma_migrations table."
    exit 1
  fi
else
  echo "WARNING: Database file not found at: $DB_FILE"
fi

# Start the server
echo "Starting server..."
exec node dist/index.js
