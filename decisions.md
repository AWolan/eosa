# Architecture & Design Decisions

This document records the key architectural, technological, and design decisions made throughout the development of the Engine Oil Sales (EOSA) system, distinguishing between human-driven choices and AI-assisted recommendations.

---

## 1. Monorepo Structure with Docker & Docker Compose
* **Context:** The system consists of an ingestion pipeline (Python producer), a relational database (PostgreSQL), and a full-stack web application/dashboard.
* **Decision:** Structured the project as a monorepo orchestrated via Docker Compose, separating services into `db`, `producer`, and `dashboard`.
* **Decision Maker:** **Human** (Initial project setup and infrastructure architecture).
* **Rationale:**
    * Eliminates environment discrepancies and simplifies local testing with a single command (`docker compose up --build`).
    * Cleanly separates infrastructure and service concerns.

---

## 2. Framework Choice for Dashboard & API: Next.js (App Router)
* **Context:** A unified solution was required to handle backend ingestion endpoints and present a real-time analytics dashboard.
* **Decision:** Used **Next.js** with the **App Router**, TypeScript, Prisma ORM, and Zod validation.
* **Decision Maker:** **Human** (Tech stack preference).
* **Rationale:**
    * Combines API routes and frontend UI rendering in a single deployable unit.
    * Ensures end-to-end type safety between database schemas and application components.

---

## 3. High-Performance Visualization: Canvas-based Charting (`canplot`)
* **Context:** The dashboard needs to render time-series sales metrics smoothly without DOM performance bottlenecks.
* **Decision:** Selected and integrated **`canplot`** (`@canplot/react`) for canvas-based rendering of line charts, custom tooltips, and crosshairs.
* **Decision Maker:** **Human** (Selected and proposed the visualization library).
* **Rationale:**
    * Avoids heavy DOM/SVG rendering overhead for time-series datasets.
    * Provides native time scales and high-frequency rendering capabilities.

---

## 4. Real-Time Updates via Server-Sent Events (SSE)
* **Context:** The dashboard needs to reflect incoming data from the Python producer in real time without heavy polling.
* **Decision:** Implemented **Server-Sent Events (SSE)** via a persistent streaming endpoint (`/api/dashboard/stream`) to broadcast updates.
* **Decision Maker:** **Human** (Proposed and initiated the SSE approach).
* **Rationale:**
    * Establishes a lightweight, unidirectional persistent connection from the server to the client.
    * Eliminates unnecessary polling overhead by pushing updates reactively.

---

## 5. Automated Quality Assurance & Testing Suite
* **Context:** Comprehensive validation was needed across Python components, database schemas, API routes, and React UI components.
* **Decision:** Implemented a multi-layered test suite featuring Python unit tests, Jest integration/UI tests, and E2E shell orchestration scripts (`run_tests.sh` / `.bat`).
* **Decision Maker:** **Collaborative** (Human defined the testing requirements and execution flow; AI assisted in debugging configuration issues, Jest module paths, and adding retry loops to health checks).
* **Rationale:**
    * Ensures high reliability and automated verification for system evaluation.
