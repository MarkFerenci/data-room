# Docker/Podman Setup Guide

This guide explains how to run the Data Room application using Docker or Podman with docker-compose.

## Prerequisites

Choose ONE of the following:
- **Docker Desktop** (includes docker-compose)
- **Docker Engine** + **docker-compose** plugin
- **Podman** + **podman-compose** (can run via `uvx podman-compose` without installing)
- **Podman** + **uv** (run `uvx podman-compose` to use podman-compose without installation)

## Quick Start

1. **Clone the repository and navigate to project root**
   ```bash
   cd /path/to/data-room
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google OAuth credentials (see `GOOGLE_OAUTH_SETUP.md`)

3. **Start all services**
   
   **Using the convenience script (recommended):**
   ```bash
   ./docker-compose.sh up
   ```
   This automatically handles podman-compose quirks and ensures all containers start.
   
   **Or manually with Docker:**
   ```bash
   docker compose up -d
   ```
   
   **Or manually with Podman:**
   ```bash
   uvx podman-compose up -d
   # Note: podman-compose may not auto-start dependent containers
   # If containers show "Created" status, manually start them:
   podman start dataroom-postgres dataroom-backend dataroom-frontend
   ```

4. **Access the application**
   - Frontend UI: http://localhost:5000
   - Backend API: http://localhost:5001
   - PostgreSQL: localhost:5433

5. **View logs**
   ```bash
   docker compose logs -f
   # or with podman-compose
   podman-compose logs -f
   # or with uvx
   uvx podman-compose logs -f
   ```

6. **Stop all services**
   ```bash
   docker compose down
   # or with podman-compose
   podman-compose down
   # or with uvx
   uvx podman-compose down
   ```

## Architecture

The application consists of three services:

### 1. PostgreSQL Database (`postgres`)
- **Image**: postgres:16-alpine
- **Port**: 5433 (host) → 5432 (container)
- **Credentials**: 
  - User: `dataroom`
  - Password: `dataroom_dev_password`
  - Database: `dataroom`
- **Data Persistence**: Volume `dataroom-postgres-data`

### 2. Flask Backend (`backend`)
- **Built from**: `./backend/Dockerfile`
- **Port**: 5001
- **Features**:
  - Hot reload enabled (volume mounted)
  - Connects to PostgreSQL via service name
  - Health check endpoint: `/health`
- **Data Persistence**: Volume `dataroom-uploads-data` for file uploads

### 3. React Frontend (`frontend`)
- **Built from**: `./ui/Dockerfile`
- **Port**: 5000
- **Features**:
  - Vite dev server with hot reload
  - Proxies `/api` requests to backend
  - Volume mounted for live code updates

## Development Workflow

### Making Code Changes

Both frontend and backend support hot reload:

**Backend changes**: Edit files in `./backend/` - Flask auto-reloads
**Frontend changes**: Edit files in `./ui/src/` - Vite hot module replacement

### Viewing Logs

View logs for all services:
```bash
docker compose logs -f
```

View logs for specific service:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Accessing Database

Connect to PostgreSQL:
```bash
docker compose exec postgres psql -U dataroom -d dataroom
# or
podman-compose exec postgres psql -U dataroom -d dataroom
```

### Rebuilding Containers

After changing dependencies (package.json, pyproject.toml):
```bash
docker compose up -d --build
# or
podman-compose up -d --build
```

Rebuild specific service:
```bash
docker compose up -d --build backend
```

## Service Dependencies

The services start in order with health checks:

1. **postgres** starts first
   - Health check: `pg_isready` command
   
2. **backend** starts after postgres is healthy
   - Health check: HTTP GET to `/health` endpoint
   
3. **frontend** starts after backend is healthy
   - No health check (depends on backend availability)

## Environment Variables

Key environment variables (configure in `.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `dev-secret-key-change-me` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (required) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | (required) |
| `OAUTH_REDIRECT_URI` | OAuth callback URL | `http://localhost:5000/auth/callback` |

The database connection is automatically configured via docker-compose.

## Data Persistence

Two named volumes persist data:

- **dataroom-postgres-data**: PostgreSQL database files
- **dataroom-uploads-data**: Backend file uploads

To remove all data and start fresh:
```bash
docker compose down -v
# or
podman-compose down -v
```

## Troubleshooting

### Backend fails to start
Check if postgres is healthy:
```bash
docker compose ps
```

View backend logs:
```bash
docker compose logs backend
```

### Frontend can't connect to backend
1. Check backend is running: http://localhost:5001/health
2. Verify CORS configuration in backend
3. Check frontend logs for proxy errors

### Permission issues (especially with Podman)
If you encounter permission errors with volumes:
```bash
# Add :Z to volume mounts for SELinux
# Edit docker-compose.yml and change:
# - ./backend:/app:Z
# - ./ui:/app:Z
```

### HEALTHCHECK warnings with Podman
You may see warnings like "HEALTHCHECK is not supported for OCI image format". This is normal and safe to ignore. Health checks are defined in docker-compose.yml and work correctly. The HEALTHCHECK directives were removed from Dockerfiles for Podman OCI compatibility.

### podman-compose not starting containers
`podman-compose` has limited support for `depends_on` with health check conditions. If you see containers in "Created" status but not running:

```bash
# Start containers manually
podman start dataroom-postgres
sleep 3  # Wait for postgres
podman start dataroom-backend
sleep 3  # Wait for backend
podman start dataroom-frontend

# Or use the convenience script which handles this automatically
./docker-compose.sh up
```

The `docker-compose.yml` has been updated to use simple `depends_on` (without conditions) for better podman-compose compatibility. The convenience script `docker-compose.sh` includes automatic workarounds for this issue.

### Ports already in use
Change port mappings in `docker-compose.yml`:
```yaml
ports:
  - "5001:5001"  # Change first number to different port
```

### Database connection refused
Ensure you're using the service name `postgres` in DATABASE_URL, not `localhost`.

## Production Considerations

For production deployment:

1. **Create separate compose file** (`docker-compose.prod.yml`)
2. **Build optimized images**:
   - Backend: Use production WSGI server (gunicorn)
   - Frontend: Build static files, serve with nginx
3. **Update environment variables**:
   - Use strong SECRET_KEY
   - Set FLASK_ENV=production
   - Configure proper CORS_ORIGINS
4. **Use secrets management** instead of .env file
5. **Configure proper health checks and restart policies**
6. **Use external database** instead of containerized postgres
7. **Set up proper logging and monitoring**

## Commands Reference

### Docker Compose

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart service
docker compose restart backend

# View logs
docker compose logs -f [service]

# Execute command in container
docker compose exec backend python -c "print('hello')"

# Rebuild and start
docker compose up -d --build

# Remove volumes
docker compose down -v
```

### Podman Compose

Same commands, replace `docker compose` with `podman-compose` or `uvx podman-compose`:

```bash
# Using installed podman-compose
podman-compose up -d
podman-compose down

# Using uvx (no installation required)
uvx podman-compose up -d
uvx podman-compose down
uvx podman-compose logs -f backend
# etc.
```

### Individual Container Management

If you prefer managing containers individually with Podman:

```bash
# Build images
podman build -t dataroom-backend ./backend
podman build -t dataroom-frontend ./ui

# Create network
podman network create dataroom-network

# Run postgres
podman run -d --name dataroom-postgres \
  --network dataroom-network \
  -e POSTGRES_USER=dataroom \
  -e POSTGRES_PASSWORD=dataroom_dev_password \
  -e POSTGRES_DB=dataroom \
  -p 5433:5432 \
  -v dataroom-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine

# Run backend
podman run -d --name dataroom-backend \
  --network dataroom-network \
  -e DATABASE_URL=postgresql://dataroom:dataroom_dev_password@dataroom-postgres:5432/dataroom \
  -p 5001:5001 \
  -v ./backend:/app:Z \
  dataroom-backend

# Run frontend
podman run -d --name dataroom-frontend \
  --network dataroom-network \
  -e VITE_BACKEND_URL=http://dataroom-backend:5001 \
  -p 5000:5000 \
  -v ./ui:/app:Z \
  dataroom-frontend
```

## Support

For issues or questions:
1. Check logs: `docker compose logs -f`
2. Verify all services are healthy: `docker compose ps`
3. Review environment variables in `.env`
4. See main README.md for application documentation
