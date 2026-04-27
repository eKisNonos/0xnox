#!/bin/bash

echo "=== Stopping 0xNOX ==="

cd "$(dirname "$0")"

# Stop backend
if [ -f ../backend/backend.pid ]; then
    kill $(cat ../backend/backend.pid) 2>/dev/null && echo "Backend stopped"
    rm ../backend/backend.pid
fi

# Stop indexer
if [ -f ../indexer/indexer.pid ]; then
    kill $(cat ../indexer/indexer.pid) 2>/dev/null && echo "Indexer stopped"
    rm ../indexer/indexer.pid
fi

echo "All services stopped"
