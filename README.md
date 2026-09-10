# Engine Oil Sales Analytics (EOSA)

A real-time analytics platform and data ingestion pipeline designed for tracking and monitoring engine oil sales, customer warranties, and salesman performance.

## System Architecture

The project is structured as a containerized monorepo orchestrated via Docker Compose, consisting of three core services:
1. **`db`**: PostgreSQL relational database storing sales events.
2. **`producer`**: A Python-based service that continuously generates and pushes sales event batches to the backend.
3. **`dashboard`**: A full-stack Next.js (App Router) application featuring backend API routes for data ingestion/validation (Zod), a real-time analytics dashboard, and Canvas-based time-series charts (`canplot`).

---

## Prerequisites

Ensure you have the following installed on your machine:
* [Docker & Docker Compose](https://www.docker.com/)
* [Node.js](https://nodejs.org/) (optional, if running tests locally)
* [Python 3.x](https://www.python.org/) (optional, if running producer tests locally)

---

## Getting Started & Running the Application

1. Clone the repository and navigate to the project root.
2. Build and start all services using Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Open your browser and access the real-time dashboard at:
   👉 http://localhost:3000


## Running the Automated Test Suite

The project includes a comprehensive multi-layered testing suite covering Python unit tests, Zod schema validations, Next.js API integration tests, React UI component tests, and an E2E health check script.

To run all tests automatically, execute the test script from the root directory:

On Linux / macOS:

```bash
./run_tests.sh
```

## Project Structure

```
eosa/
├── dashboard/               # Next.js full-stack dashboard & API service
│   ├── prisma/              # Database schema & migrations
│   ├── src/
│   │   ├── app/             # App Router (API routes, Server-Sent Events stream, dashboard UI)
│   │   ├── components/      # UI components (Canvas charts, tables)
│   │   └── lib/             # Shared logic, Prisma client, Zod validation schemas
│   ├── jest.config.js       # Jest configuration for unit & integration tests
│   └── jest.setup.ts        # Testing library setup
├── producer/                # Python data producer service & unit tests
├── docker-compose.yml       # Central infrastructure orchestration
├── run_tests.sh             # Automated test script for Linux/macOS
├── run_tests.bat            # Automated test script for Windows
└── decisions.md             # Architecture & design decisions record
```
