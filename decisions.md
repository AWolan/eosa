# Technical Decisions & Architecture

## System Architecture Overview
The application is strictly self-contained and runs 100% locally using Docker Compose. All components—the producer, the API, the frontend, and the database—communicate over a private, isolated Docker network. There are no cloud dependencies, third-party analytics, or external data sharing mechanisms, ensuring complete data privacy and local control.

## Decisions Made by Human (Developer)
*   **Tech Stack Choices:** Selected Python for the producer, Next.js for the unified frontend and backend, React for the UI, and PostgreSQL for persistent storage.
*   **Charting Library:** Required the use of the specific custom library (`jedzej/canplot`) for the time-series visualization.
*   **Data Integrity Stance:** Chose to temporarily log and discard malformed data to prioritize application stability and keep the data stream uninterrupted, rather than crashing or pausing the producer.
*   **Component Architecture:** Instructed that Next.js act as a monolithic full-stack container (handling both API routes and frontend rendering) to reduce infrastructure complexity.
*   **Communication Protocol:** Chose direct HTTP POST requests between the Python script and the Next.js server to start simple, bypassing message brokers (like Kafka or RabbitMQ) until business requirements demand them.

## Decisions Made by AI (Assistant)
*   **Validation Layer (Zod):** Introduced Zod on the API route to enforce strict schema validation, providing a clean boundary against the corrupted payloads injected by the producer.
*   **Database Schema Design (Prisma):** Designed a flat database schema (`SaleEvent`) rather than normalized tables (e.g., separate `Salesman` or `Customer` tables). This optimizes ingestion speed and simplifies SQL grouping for dashboard aggregations.
*   **Next.js Prisma Singleton Fix:** Implemented a global Prisma client singleton to prevent database connection exhaustion caused by Next.js hot-reloading in the development environment.
*   **Fault Injection Logic:** Designed the Python producer to randomly corrupt 15% of the data (dropping fields, inserting nulls, changing types) to fulfill the extra points requirement while generating a predictable 30-second loop.
*   **Dashboard State & Polling:** Implemented standard React `useEffect` polling at a 10-second interval to fetch the latest server-side aggregations, ensuring the UI remains dynamic without complex WebSocket setups.