#!/bin/bash

# Zatrzymuje skrypt, jesli ktorykolwiek test zwroci blad
set -e

echo "======================================="
echo "1. Running Producer Tests (Python)"
echo "======================================="
docker compose exec producer python -m unittest test_main.py

echo -e "\n======================================="
echo "2. Running Dashboard Tests (Next.js/React)"
echo "======================================="
docker compose exec dashboard npx jest

echo -e "\n======================================="
echo "3. Running E2E Healthcheck"
echo "======================================="
# Używamy skryptu, który przygotowaliśmy wcześniej
bash e2e_healthcheck.sh

echo -e "\n======================================="
echo "✅ ALL TESTS PASSED SUCCESSFULLY!"
echo "======================================="
