# Rizk: The Compliance Layer for Enterprise AI

Rizk is an open-source compliance-as-code SDK that empowers enterprises to deploy AI with confidence, security, and regulatory alignment. It provides a real-time monitoring and automated policy enforcement layer, ensuring AI systems adhere to ethical, legal, and business policies seamlessly.

## Project Structure

This is a monorepo using Bun, structured as follows:

```
platform/
├── apps/
│   ├── api/    # Backend API application
│   └── app/    # Frontend application
└── packages/   # Shared utilities and modules
```

## Prerequisites

- [Bun](https://bun.sh)

## Getting Started

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp apps/api/.env.example apps/api/.env
```

3. Run the API:
```bash
cd apps/api
bun run dev
```

4. Run the frontend app:
```bash
cd apps/app
bun run dev
```