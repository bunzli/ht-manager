# Deployment Guide for Umbrel with Dockge

This guide explains how to deploy Hattrick Manager using Dockge in your Umbrel instance and configure Cloudflare Tunnel for custom domain access.

## Prerequisites

- Umbrel instance running
- Dockge app installed in Umbrel
- Cloudflare Tunnel app installed in Umbrel
- Cloudflare account with domain `bunzli.cl` configured
- CHPP API credentials (Consumer Key, Consumer Secret, Access Token, Access Token Secret, Team ID)

## Step 1: Prepare Your Environment

**Option A: Set environment variables directly in Dockge UI (Recommended)**

You can set environment variables directly in the Dockge UI when creating/editing your stack. Skip to Step 2 and configure them there.

**Option B: Use a `.env` file**

If you prefer to use a `.env` file:

1. **Create a `.env` file** in the project root with your credentials:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./server/prisma/server/prisma/dev.db
CHPP_CONSUMER_KEY=your_consumer_key
CHPP_CONSUMER_SECRET=your_consumer_secret
CHPP_ACCESS_TOKEN=your_access_token
CHPP_ACCESS_TOKEN_SECRET=your_access_token_secret
CHPP_TEAM_ID=your_team_id
```

2. **Create a `data` directory** for database persistence:

```bash
mkdir -p data
```

## Step 2: Deploy with Dockge

**No need to clone the repository!** The docker-compose.yml is configured to build directly from GitHub.

1. **Open Dockge** in your Umbrel dashboard
2. **Create a new stack**:
   - Click "+ Compose" button
   - Enter stack name: `ht-manager` (lowercase only)
3. **Paste docker-compose.yml**:
   - Copy the contents of `docker-compose.yml` from https://github.com/bunzli/ht-manager
   - Paste it into Dockge's YAML editor (right panel)
   - The build context is already configured to pull from GitHub automatically
4. **Create data directory** (for database persistence):
   - In Dockge, you may need to create a `data` directory in the stack folder
   - Or ensure the volume path `./data` exists relative to where Dockge stores the stack
5. **Configure environment variables**:
   - In the right panel, find the ".env" section
   - Add your environment variables directly in the UI:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=file:./prisma/server/prisma/dev.db
     CHPP_CONSUMER_KEY=your_consumer_key
     CHPP_CONSUMER_SECRET=your_consumer_secret
     CHPP_ACCESS_TOKEN=your_access_token
     CHPP_ACCESS_TOKEN_SECRET=your_access_token_secret
     CHPP_TEAM_ID=your_team_id
     ```
6. **Start the stack**:
   - Click "Start" or "Deploy" button
   - Wait for the build to complete (first build may take several minutes)
   - Check logs to ensure the container starts successfully

## Step 3: Verify Local Access

1. **Access the app locally**:
   - Open `http://umbrel.local:3000` in your browser
   - You should see the Hattrick Manager interface
   - The API should be accessible at `http://umbrel.local:3000/api`

## Step 4: Configure Cloudflare Tunnel

1. **Open Cloudflare Tunnel** in your Umbrel dashboard
2. **Create a new public hostname**:
   - Click "Add Public Hostname" or similar
   - Configure as follows:
     - **Subdomain**: `ht`
     - **Domain**: `bunzli.cl`
     - **Service**: `http://localhost:3000` (or `http://ht-manager:3000` if using Docker network)
     - **Path**: Leave empty (or add `/` if required)
3. **Save the configuration**
4. **Verify the tunnel is active**:
   - Check that the tunnel status shows as "Active" or "Healthy"
   - The public hostname should be listed

## Step 5: DNS Configuration (if needed)

If Cloudflare Tunnel doesn't automatically configure DNS:

1. **Go to Cloudflare Dashboard** → DNS → Records
2. **Add a CNAME record**:
   - **Type**: CNAME
   - **Name**: `ht`
   - **Target**: Your Cloudflare Tunnel's public hostname (usually something like `xxxxx.cfargotunnel.com`)
   - **Proxy status**: Proxied (orange cloud)
   - **TTL**: Auto

## Step 6: Access Your App

1. **Open your browser** and navigate to `https://ht.bunzli.cl`
2. **Verify SSL certificate**:
   - Cloudflare Tunnel automatically provides SSL certificates
   - The connection should be secure (HTTPS)
3. **Test the application**:
   - Verify the UI loads correctly
   - Test API endpoints (e.g., `/api/health`)
   - Test syncing players from Hattrick

## Troubleshooting

### Container won't start
- Check Dockge logs for build errors
- Verify all environment variables are set correctly
- Ensure the `.env` file exists and has correct values
- Check that port 3000 is not already in use

### Database issues
- Verify the `data` directory exists and has correct permissions
- Check that the volume mount path is correct: `./data:/app/server/prisma/server/prisma`
- Ensure Prisma migrations have run (they should run automatically on first start)

### Cloudflare Tunnel not working
- Verify the tunnel is pointing to `http://localhost:3000` (or the correct Docker service name)
- Check that the app is accessible locally at `umbrel.local:3000`
- Verify DNS records are configured correctly
- Check Cloudflare Tunnel logs in Umbrel

### Static files not loading
- Verify the client build completed successfully
- Check that `client/dist` directory exists in the container
- Review server logs for static file serving errors

### API endpoints not working
- Ensure requests are going to `/api/*` paths
- Check CORS configuration if accessing from different origins
- Verify the server is running and healthy (`/api/health`)

## Maintenance

### Updating the Application

Since the build context points to GitHub, updating is simple:

1. **Push your changes** to the GitHub repository (if you made local changes)
2. **Rebuild the stack** in Dockge:
   - Click "Rebuild" or stop/start the stack
   - Docker will automatically pull the latest code from GitHub and rebuild the image

### Database Backups

The SQLite database is stored in the `data` directory. To backup:

```bash
# From your Umbrel server
cp /path/to/ht-manager/data/dev.db /path/to/backup/dev.db.backup
```

### Viewing Logs

- **Dockge**: Click on your stack → Logs tab
- **Umbrel Terminal**: Use `docker logs ht-manager` if SSH access is available

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- Regularly update Docker images and dependencies
- Use Cloudflare's security features (WAF, rate limiting) if needed
- Consider adding authentication if exposing to the internet

## Support

For issues specific to:
- **Dockge**: Check [Dockge documentation](https://dockge.kuma.pet/)
- **Cloudflare Tunnel**: Check [Cloudflare Tunnel documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- **Umbrel**: Check [Umbrel documentation](https://docs.umbrel.com/)

