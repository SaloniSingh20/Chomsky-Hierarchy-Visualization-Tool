# Chomsky Hierarchy Visualization Tool

An interactive full-stack project to explore formal grammars and the Chomsky hierarchy with live classification, derivations, and automata visualizations.

## Features

- Classify grammars into Type 0, Type 1, Type 2, or Type 3
- Generate and display:
  - Parse tree
  - NFA and DFA graphs
  - Transition tables
  - Derivation steps
  - Closure properties
- Explore educational hierarchy content by grammar type
- Simulator page with one-input classification workflow

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, D3
- Backend: Node.js, Express

## Project Structure

- `frontend/` - Next.js UI
- `server/` - Express API and grammar/classifier services

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm

## Local Setup

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Install backend dependencies

```bash
cd ../server
npm install
```

## Run Locally

### Start backend (port 4000)

```bash
cd server
node server.js
```

### Start frontend (typically port 3000 or 3001)

```bash
cd frontend
npm run dev
```

Open the simulator page at:

- `http://localhost:3000/simulator` or
- `http://localhost:3001/simulator`

(depending on which port is available)

## API Endpoints

Base URL: `http://localhost:4000/api`

- `GET /health`
- `GET /hierarchy`
- `GET /type/:id`
- `GET /explore-content`
- `POST /simulate`
- `POST /classify`

### Example classify request

```json
{
  "grammar": "S->aS|b"
}
```

## Notes

- The frontend reads API base URL from `NEXT_PUBLIC_API_URL`; defaults to `http://localhost:4000/api`.
- If tab/icon updates do not appear immediately, do a hard refresh to clear favicon cache.
