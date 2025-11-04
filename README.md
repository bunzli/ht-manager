# Hattrick Manager

Local web application to track player evolution for hattrick.org.

## Requirements

- Node.js 20+
- npm 10+

## Setup

1. Copy `.env.example` to `.env` and fill in your CHPP credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations and generate Prisma client:
   ```bash
   cd server
   npx prisma migrate dev
   ```

## Development

Start both backend and frontend:

```bash
npm run dev
```

- Backend runs on `http://localhost:3001`.
- Frontend runs on `http://localhost:5173` with `/api` requests proxied to the backend.

## Build

```bash
npm run build
```

This builds the server TypeScript output (`server/dist`) and the frontend production bundle (`client/dist`).

## Project Structure

- `server/` – Express API, Prisma schema, CHPP sync logic.
- `client/` – Vite + React UI with Material UI DataGrid and configuration page.

## Next Steps

- Implement authentication with CHPP if needed for multi-user setups.
- Expand player detail view to display historical change charts.
- Add automated sync scheduling using cron or background jobs.
- Write integration tests for sync logic and UI flows.
