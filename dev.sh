#!/bin/bash

# Script to run both backend and client development servers

echo "Starting ViVu development servers..."
echo "========================================"
echo ""

# Check if .env files exist
if [ ! -f "packages/backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from .env.example..."
    cp packages/backend/.env.example packages/backend/.env
    echo "⚠️  Please update packages/backend/.env with your GEMINI_API_KEY"
fi

if [ ! -f "packages/client/.env" ]; then
    echo "⚠️  Client .env file not found. Creating from .env.example..."
    cp packages/client/.env.example packages/client/.env
fi

echo ""
echo "Starting backend on http://localhost:3000..."
cd packages/backend && npm run dev &
BACKEND_PID=$!

echo "Starting client on http://localhost:5173..."
cd ../client && npm run dev &
CLIENT_PID=$!

echo ""
echo "========================================"
echo "✅ Servers started!"
echo "Backend: http://localhost:3000"
echo "Client:  http://localhost:5173"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Trap SIGINT (Ctrl+C) to kill both processes
trap "kill $BACKEND_PID $CLIENT_PID; exit" INT

# Wait for both processes
wait
