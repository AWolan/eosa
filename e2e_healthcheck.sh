#!/bin/bash

echo "Starting E2E Infrastructure Test..."
echo "Waiting for Next.js server to start (it might be installing packages)..."

MAX_RETRIES=15
RETRY_COUNT=0
HTTP_STATUS=000

# 1. Wait for the frontend to return 200 OK (Retry loop)
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)

  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Frontend is up and responding (HTTP 200)"
    break
  fi

  echo "Server not ready yet (Got $HTTP_STATUS). Retrying in 5 seconds... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
  sleep 5
  RETRY_COUNT=$((RETRY_COUNT+1))
done

# If it still isn't 200 after all retries, fail the test
if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "❌ Frontend failed to start within the time limit. Expected 200, got $HTTP_STATUS"
  exit 1
fi

# 2. Check if the API is accepting data streams
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST -d '[]' -H "Content-Type: application/json" http://127.0.0.1:3000/api/sales)

if [ "$API_STATUS" -eq 200 ]; then
  echo "✅ Ingestion API is up and accepting payloads (HTTP 200)"
else
  echo "❌ API failed. Expected 200, got $API_STATUS"
  exit 1
fi

echo "======================================="
echo "✅ All E2E checks passed!"
