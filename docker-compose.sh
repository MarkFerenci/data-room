#!/usr/bin/env bash
# Quick start script for Data Room application with Docker/Podman

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Data Room Docker/Podman Setup ===${NC}\n"

# Detect which container runtime is available
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    echo -e "${GREEN}✓ Using Docker Compose${NC}"
elif command -v podman-compose &> /dev/null; then
    COMPOSE_CMD="podman-compose"
    echo -e "${GREEN}✓ Using Podman Compose${NC}"
elif command -v uvx &> /dev/null && command -v podman &> /dev/null; then
    COMPOSE_CMD="uvx podman-compose"
    echo -e "${GREEN}✓ Using Podman with uvx podman-compose${NC}"
else
    echo -e "${RED}✗ Error: No container runtime found!${NC}"
    echo -e "Please install one of the following:"
    echo -e "  - Docker Desktop (includes docker compose)"
    echo -e "  - Docker Engine + docker-compose plugin"
    echo -e "  - Podman + podman-compose"
    echo -e "  - Podman + uv (for uvx podman-compose)"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}⚠ .env file not found${NC}"
    if [ -f .env.example ]; then
        echo -e "${BLUE}Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file${NC}"
        echo -e "\n${YELLOW}⚠ IMPORTANT: Edit .env and add your Google OAuth credentials${NC}"
        echo -e "See GOOGLE_OAUTH_SETUP.md for instructions"
        echo -e "\nPress Enter to continue or Ctrl+C to exit and edit .env first..."
        read
    else
        echo -e "${RED}✗ Error: .env.example not found${NC}"
        exit 1
    fi
fi

# Parse command line argument
ACTION=${1:-up}

case $ACTION in
    up|start)
        echo -e "\n${BLUE}Starting all services...${NC}"
        $COMPOSE_CMD up -d
        
        # If using podman-compose, containers may need manual start
        if [[ "$COMPOSE_CMD" == *"podman-compose"* ]]; then
            echo -e "${BLUE}Ensuring all containers are started (podman-compose workaround)...${NC}"
            sleep 2
            podman start dataroom-postgres 2>/dev/null || true
            sleep 3
            podman start dataroom-backend 2>/dev/null || true
            sleep 3
            podman start dataroom-frontend 2>/dev/null || true
        fi
        
        echo -e "\n${GREEN}✓ Services started successfully!${NC}"
        echo -e "\n${BLUE}Access the application:${NC}"
        echo -e "  Frontend UI: ${GREEN}http://localhost:5000${NC}"
        echo -e "  Backend API: ${GREEN}http://localhost:5001${NC}"
        echo -e "  PostgreSQL:  ${GREEN}localhost:5433${NC}"
        echo -e "\n${BLUE}View logs:${NC}"
        echo -e "  $COMPOSE_CMD logs -f"
        ;;
    
    down|stop)
        echo -e "\n${BLUE}Stopping all services...${NC}"
        $COMPOSE_CMD down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    
    restart)
        echo -e "\n${BLUE}Restarting all services...${NC}"
        $COMPOSE_CMD restart
        echo -e "${GREEN}✓ Services restarted${NC}"
        ;;
    
    logs)
        SERVICE=${2:-}
        if [ -n "$SERVICE" ]; then
            $COMPOSE_CMD logs -f "$SERVICE"
        else
            $COMPOSE_CMD logs -f
        fi
        ;;
    
    ps|status)
        $COMPOSE_CMD ps
        ;;
    
    build)
        echo -e "\n${BLUE}Building images...${NC}"
        $COMPOSE_CMD build
        echo -e "${GREEN}✓ Build complete${NC}"
        ;;
    
    rebuild)
        echo -e "\n${BLUE}Rebuilding and restarting services...${NC}"
        $COMPOSE_CMD up -d --build
        echo -e "${GREEN}✓ Services rebuilt and started${NC}"
        ;;
    
    clean)
        echo -e "\n${YELLOW}⚠ This will stop services and remove volumes (all data will be lost!)${NC}"
        echo -e "Press Enter to continue or Ctrl+C to cancel..."
        read
        $COMPOSE_CMD down -v
        echo -e "${GREEN}✓ Services stopped and volumes removed${NC}"
        ;;
    
    help|--help|-h)
        echo -e "Usage: $0 [COMMAND]"
        echo -e "\nCommands:"
        echo -e "  ${GREEN}up, start${NC}     Start all services (default)"
        echo -e "  ${GREEN}down, stop${NC}    Stop all services"
        echo -e "  ${GREEN}restart${NC}       Restart all services"
        echo -e "  ${GREEN}logs [service]${NC} View logs (optionally for specific service)"
        echo -e "  ${GREEN}ps, status${NC}    Show service status"
        echo -e "  ${GREEN}build${NC}         Build all images"
        echo -e "  ${GREEN}rebuild${NC}       Rebuild images and restart services"
        echo -e "  ${GREEN}clean${NC}         Stop services and remove volumes (destroys data!)"
        echo -e "  ${GREEN}help${NC}          Show this help message"
        echo -e "\nExamples:"
        echo -e "  $0 up              # Start all services"
        echo -e "  $0 logs backend    # View backend logs"
        echo -e "  $0 rebuild         # Rebuild after dependency changes"
        exit 0
        ;;
    
    *)
        echo -e "${RED}✗ Unknown command: $ACTION${NC}"
        echo -e "Run '$0 help' for usage information"
        exit 1
        ;;
esac
