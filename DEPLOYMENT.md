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

## Step 2: Ensure Docker Image is Built

The Docker image is automatically built and pushed to GitHub Container Registry (GHCR) when you push to the `main` branch. 

**First time setup:**
1. Push your code to GitHub (if you haven't already)
2. The GitHub Actions workflow will automatically build and push the image to `ghcr.io/bunzli/ht-manager:latest`
3. Make sure the package is public (if needed):
   - Go to https://github.com/bunzli/ht-manager/pkgs/container/ht-manager
   - Click "Package settings" → Change visibility to "Public" if it's private

## Step 3: Deploy with Dockge

**No need to build locally!** The docker-compose.yml uses a pre-built image from GitHub Container Registry.

1. **Open Dockge** in your Umbrel dashboard
2. **Create a new stack**:
   - Click "+ Compose" button
   - Enter stack name: `ht-manager` (lowercase only)
3. **Paste docker-compose.yml**:
   - Copy the contents of `docker-compose.yml` from https://github.com/bunzli/ht-manager
   - Paste it into Dockge's YAML editor (right panel)
   - The image will be pulled from `ghcr.io/bunzli/ht-manager:latest`
4. **Configure environment variables** (REQUIRED):
   - In the right panel, find the ".env" section
   - **You MUST add your CHPP credentials here** - the app will not start without them!
   - Add your environment variables directly in the UI:
     ```
     CHPP_CONSUMER_KEY=your_actual_consumer_key_here
     CHPP_CONSUMER_SECRET=your_actual_consumer_secret_here
     CHPP_ACCESS_TOKEN=your_actual_access_token_here
     CHPP_ACCESS_TOKEN_SECRET=your_actual_access_token_secret_here
     CHPP_TEAM_ID=your_actual_team_id_here
     ```
   - **Important**: Replace the placeholder values with your actual CHPP API credentials
   - These variables will be automatically passed to the container via the docker-compose.yml environment section
6. **Start the stack**:
   - Click "Start" or "Deploy" button
   - Docker will pull the image from GHCR (first pull may take a minute)
   - Check logs to ensure the container starts successfully

## Step 4: Verify Local Access

1. **Access the app locally**:
   - Open `http://umbrel.local:3000` in your browser
   - You should see the Hattrick Manager interface
   - The API should be accessible at `http://umbrel.local:3000/api`

## Step 5: Configure Cloudflare Tunnel

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

## Step 6: DNS Configuration (if needed)

If Cloudflare Tunnel doesn't automatically configure DNS:

1. **Go to Cloudflare Dashboard** → DNS → Records
2. **Add a CNAME record**:
   - **Type**: CNAME
   - **Name**: `ht`
   - **Target**: Your Cloudflare Tunnel's public hostname (usually something like `xxxxx.cfargotunnel.com`)
   - **Proxy status**: Proxied (orange cloud)
   - **TTL**: Auto

## Step 7: Access Your App

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
- Check Dockge logs for errors
- Verify the Docker image exists: `ghcr.io/bunzli/ht-manager:latest`
- If image is private, you may need to authenticate: `docker login ghcr.io`
- Verify all environment variables are set correctly
- Check that port 3000 is not already in use

### Image pull fails
- Ensure the GitHub Container Registry package is public (or authenticate if private)
- Check GitHub Actions workflow ran successfully
- Verify the image tag is correct: `ghcr.io/bunzli/ht-manager:latest`

### Database issues
- The database is stored in a Docker named volume `ht-manager-data` (created automatically)
- To view the database location: `docker volume inspect ht-manager-data`
- To backup the database: `docker run --rm -v ht-manager-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data`
- To restore: `docker run --rm -v ht-manager-data:/data -v $(pwd):/backup alpine tar xzf /backup/db-backup.tar.gz -C /data`
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

Updating is simple with GitHub Actions:

1. **Push your changes** to the GitHub repository
2. **Wait for GitHub Actions** to build and push the new image (check Actions tab)
3. **Pull the latest image** in Dockge:
   - Click "Rebuild" or stop/start the stack
   - Docker will pull the latest image from GHCR automatically
   - Or manually pull: `docker pull ghcr.io/bunzli/ht-manager:latest`

### Database Backups

The SQLite database is stored in a Docker named volume `ht-manager-data`. To backup:

```bash
# Backup the entire volume
docker run --rm -v ht-manager-data:/data -v $(pwd):/backup alpine tar czf /backup/ht-manager-db-backup.tar.gz /data

# Or backup just the database file
docker run --rm -v ht-manager-data:/data -v $(pwd):/backup alpine sh -c "cp /data/dev.db /backup/dev.db.backup"
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

