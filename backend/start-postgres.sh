#!/bin/bash

# Script to start PostgreSQL in Podman container for Data Room application

CONTAINER_NAME="dataroom-postgres"
POSTGRES_USER="dataroom"
POSTGRES_PASSWORD="dataroom_dev_password"
POSTGRES_DB="dataroom"
POSTGRES_PORT="5433"

# Check if container already exists
if podman ps -a | grep -q $CONTAINER_NAME; then
    echo "Container $CONTAINER_NAME already exists. Starting it..."
    podman start $CONTAINER_NAME
else
    echo "Creating and starting new PostgreSQL container..."
    podman run -d \
        --name $CONTAINER_NAME \
        -e POSTGRES_USER=$POSTGRES_USER \
        -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
        -e POSTGRES_DB=$POSTGRES_DB \
        -p $POSTGRES_PORT:5432 \
        -v dataroom-pgdata:/var/lib/postgresql/data \
        docker.io/library/postgres:16-alpine
fi

echo "PostgreSQL container is running!"
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: $POSTGRES_PORT"
echo "  Database: $POSTGRES_DB"
echo "  User: $POSTGRES_USER"
echo "  Password: $POSTGRES_PASSWORD"
echo ""
echo "To stop: podman stop $CONTAINER_NAME"
echo "To remove: podman rm -f $CONTAINER_NAME"
echo "To remove volume: podman volume rm dataroom-pgdata"
