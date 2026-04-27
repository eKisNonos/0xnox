#!/bin/bash
cd "$(dirname "$0")/../indexer"
source .env 2>/dev/null
cargo run --release
