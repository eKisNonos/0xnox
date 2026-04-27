#!/bin/bash
set -e

echo "=== 0xNOX Setup ==="

# Check dependencies
command -v python3 >/dev/null 2>&1 || { echo "Python3 required"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "PostgreSQL required"; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo "Rust/Cargo required"; exit 1; }

# Database setup
echo "Setting up database..."
createdb oxnox 2>/dev/null || echo "Database already exists"
psql oxnox < ../backend/schema.sql

# Backend setup
echo "Setting up backend..."
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env 2>/dev/null || true

# Indexer setup
echo "Building indexer..."
cd ../indexer
cargo build --release
cp .env.example .env 2>/dev/null || true

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your DATABASE_URL"
echo "2. Edit indexer/.env with your FACTORY_ADDRESS"
echo "3. Edit frontend/js/config.js with your addresses"
echo "4. Run: ./scripts/start.sh"
