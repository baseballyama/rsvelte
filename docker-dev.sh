#!/bin/bash
# Docker development helper script

set -e

COMPOSE_FILE="docker-compose.yml"
SERVICE="dev"

case "$1" in
  build)
    echo "Building Docker image..."
    docker compose -f $COMPOSE_FILE build
    ;;
  up)
    echo "Starting development container..."
    docker compose -f $COMPOSE_FILE up -d
    echo "Container started. Use './docker-dev.sh shell' to enter."
    ;;
  down)
    echo "Stopping development container..."
    docker compose -f $COMPOSE_FILE down
    ;;
  shell)
    echo "Entering development container..."
    docker compose -f $COMPOSE_FILE exec $SERVICE bash
    ;;
  run)
    shift
    echo "Running command in container: $@"
    docker compose -f $COMPOSE_FILE exec $SERVICE "$@"
    ;;
  test)
    echo "Running tests in container..."
    docker compose -f $COMPOSE_FILE exec $SERVICE cargo test "${@:2}"
    ;;
  clean)
    echo "Cleaning up containers and volumes..."
    docker compose -f $COMPOSE_FILE down -v
    ;;
  logs)
    docker compose -f $COMPOSE_FILE logs -f
    ;;
  *)
    echo "Usage: $0 {build|up|down|shell|run|test|clean|logs}"
    echo ""
    echo "Commands:"
    echo "  build  - Build the Docker image"
    echo "  up     - Start the development container"
    echo "  down   - Stop the development container"
    echo "  shell  - Enter the container shell"
    echo "  run    - Run a command in the container (e.g., ./docker-dev.sh run cargo build)"
    echo "  test   - Run cargo test in the container"
    echo "  clean  - Remove containers and volumes"
    echo "  logs   - Show container logs"
    exit 1
    ;;
esac
