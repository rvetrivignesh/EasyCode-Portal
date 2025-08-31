#!/bin/bash

# Navigate to backend directory
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Start FastAPI server
echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation available at http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
