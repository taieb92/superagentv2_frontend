#!/bin/bash
# Deploy script for DEV environment
# Usage: ./deploy-dev.sh [build|up|down|restart|logs]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.dev"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env.dev file not found at $ENV_FILE"
    exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)

# Parse the command
COMMAND=$1

if [ "$COMMAND" = "down" ]; then
    echo "🛑 Force removing existing container (if exists)..."
    docker rm -f superagent-frontend-dev || true
fi

docker compose -f "${SCRIPT_DIR}/docker-compose.dev.yml" "$@"
