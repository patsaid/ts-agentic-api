# ts-agentic-api
A TypeScript + Express backend for the Agentic demo application. Provides user management and AI agent endpoints.

---

## Features

- REST API for users (`/users`)
  - Create user
  - List users
- AI agent endpoints (`/agent`)
  - Ask a question
  - Weather query
  - Local database fetch
- MongoDB integration
- Swagger API documentation
- TypeScript support

---

## Requirements

- Node.js >= 18
- npm
- MongoDB (local or remote)
- Docker (optional)

---

## Setup

1. Clone the repo:

```bash
git clone <repo-url>
cd backend
```

2. Install dependencies:

```bash
git clone <repo-url>
cd backend
```


3. Configure environment variables (.env):

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/agentdb
OPENAI_API_KEY=your-openai-api-key
```

## Docker
Build and run with Docker:
```bash
docker-compose up --build
```

## API
- Users: /users
    - POST /users – create user
    - GET /users – list users

- Agent: /agent
    - POST /agent/ask – ask a question
    - GET /agent/weather/:city – weather info
    - GET /agent/local/:name – local DB fetch

- Swagger docs available at: /api-docs