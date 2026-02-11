#!/bin/bash
# Deploy script for STAGING environment
# Usage: ./deploy-staging.sh [build|up|down|restart|logs]

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_ROOT}/.env.staging"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env.staging file not found at $ENV_FILE"
    exit 1
fi

# Export all variables from .env.staging (excluding comments and empty lines)
export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)

# Parse the command
COMMAND=$1

if [ "$COMMAND" = "down" ]; then
    echo "🛑 Force removing existing container (if exists)..."
    docker rm -f superagent-frontend-staging || true
fi

docker compose -f "${SCRIPT_DIR}/docker-compose.staging.yml" "$@"
