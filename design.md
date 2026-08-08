# System Design: Engine Oil Sales Aggregation

## 1. Overview
The Engine Oil Sales Aggregation system is a fully localized, self-contained application designed to ingest, store, and visualize a continuous stream of sales events. The entire stack is containerized using Docker Compose, ensuring that it runs entirely on local infrastructure without requiring external cloud dependencies or telemetry.

## 2. Architecture & Tech Stack

The system is composed of a single Docker Compose network orchestrating three main containers:

1.  **Producer (Python):** A standalone container generating mock sales data.
2.  **Fullstack Application (Next.js):** Handles both data reception (API routes) and data visualization (React frontend).
3.  **Database (PostgreSQL):** Persistent relational storage managed via Prisma ORM.

## 3. Component Breakdown

### 3.1. Data Production (Python Producer)
*   **Mechanism:** A Python script running an infinite loop, emitting a batch of sales events every 30 seconds via direct HTTP `POST` requests.
*   **Data Generation:** Uses the `Faker` library to generate realistic synthetic data for salesmen, companies, and dates.
*   **Fault Injection:** To ensure system resilience, the producer will occasionally corrupt the outgoing payload (e.g., missing required fields, mismatched types, or invalid JSON structures).

### 3.2. Data Reception (Next.js API & Prisma)
*   **Endpoint:** A dedicated Next.js API route (e.g., `POST /api/sales`) acts as the ingestion point.
*   **Validation:** Incoming payloads are strictly validated using `Zod`. 
*   **Error Handling:** Malformed or incomplete events are caught by the validation layer. They are currently logged to `stdout`/`stderr` and dropped, returning a `200 OK` or `202 Accepted` to the producer to maintain the stream. (A Dead Letter Queue / storage strategy can be implemented in future iterations).
*   **Persistence:** Valid events are saved to the PostgreSQL database using Prisma ORM. The database utilizes Docker volumes to ensure data survives container restarts.

### 3.3. Data Visualization (Next.js React Frontend)
*   **Dashboard UI:** A responsive React page polling or fetching the Next.js API for aggregated metrics.
*   **Leaderboard:** A tabular view aggregating total sales volume (in USD or Litres) grouped by the salesman.
*   **Alert System:** A logic block querying the database for `warranty type == "time"` or `"mileage"` to identify and display the specific customer with the closest expiring warranty.
*   **Graphs:** Implemented using `canplot`. The graph displays cumulative sales over time, offering:
    *   Multiple series (one per salesman).
    *   Toggles to hide/show specific salesmen.
    *   Annotations representing individual significant sales events.

## 4. Data Model (Draft Prisma Schema)

```prisma
model SaleEvent {
  id                    String   @id @default(uuid())
  sellDate              DateTime
  amountLitres          Float
  pricePerLitre         Float
  customerCompany       String
  salesmanName          String
  warrantyType          String   // "mileage" or "time"
  expectedYearlyMileage Int?     // Only if warrantyType == "mileage"
  warrantyPeriodDays    Int      // Representing the time duration
  createdAt             DateTime @default(now())
}

## 5. Future Considerations
*   Decoupled Ingestion: Transitioning from direct HTTP POSTs to a message broker (like RabbitMQ or Redis Pub/Sub) if traffic scales or multiple consumers are introduced.
*   Dead Letter Queue: Upgrading the "log and drop" error handling to store malformed payloads in a separate database table for auditing and reprocessing.
