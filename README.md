# Engine Oil Sales Aggregation

A full-stack, local-only system designed to ingest, store, and visualize a continuous stream of engine oil sales events. The entire infrastructure is containerized to ensure zero data leaves your machine.

## Features
*   **Continuous Event Streaming:** A Python producer generating sales data every 30 seconds, including simulated fault injection (malformed data).
*   **Robust Ingestion API:** A Next.js backend strictly validating incoming data with Zod, smoothly dropping broken payloads without crashing.
*   **Persistent Storage:** PostgreSQL database using Prisma ORM to ensure all valid sales data survives container restarts.
*   **Live Dashboard:** A React frontend that polls for aggregated metrics, displaying a sales leaderboard, active alerts for the closest expiring warranty, and a cumulative sales chart using `canplot`.

## Prerequisites
*   [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Application

To start the entire infrastructure (Producer, API/Frontend, and Database), run the following command in the root directory:

```bash
docker compose up --build
```

## Project structure:

engine-oil-sales/

├── docker-compose.yml      # Orchestrates all services

├── .env                    # Shared environment variables

├── producer/               # Python generator

│   ├── Dockerfile

│   ├── requirements.txt

│   └── main.py             # Empty for now (will contain the loop)

└── web/                    # Next.js Fullstack (Frontend + API + Prisma)

    └── Dockerfile          # Setup for Node.js

