#!/bin/bash
cd "$(dirname "$0")/../backend"
source .env 2>/dev/null
psql "$DATABASE_URL" -f schema.sql
