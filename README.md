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