#!/bin/bash

echo "=== Starting 0xNOX ==="

# Start backend
echo "Starting backend..."
cd "$(dirname "$0")/../backend"
source venv/bin/activate 2>/dev/null || true
nohup uvicorn api.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
echo $! > backend.pid
echo "Backend started (PID: $(cat backend.pid))"

# Start indexer
echo "Starting indexer..."
cd ../indexer
nohup ./target/release/oxnox-indexer > indexer.log 2>&1 &
echo $! > indexer.pid
echo "Indexer started (PID: $(cat indexer.pid))"

echo ""
echo "=== Services Running ==="
echo "Backend: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  Backend: backend/backend.log"
echo "  Indexer: indexer/indexer.log"
echo ""
echo "Stop with: ./scripts/stop.sh"
