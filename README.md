# Chomsky Hierarchy Visualization Tool

An interactive full-stack web application for learning formal languages and grammars through the Chomsky hierarchy. The app accepts grammar input, classifies it, and visualizes the resulting automata and derivations.

## What This Project Teaches

This project helps students understand how language classes relate to grammar restrictions and machine models.

The hierarchy used is:

Type 3 subset Type 2 subset Type 1 subset Type 0

Each higher type is more expressive, but usually harder to analyze.

## Formal Language and Grammar Basics

A grammar is commonly written as G = (V, T, P, S):

- V: non-terminals (variables such as S, A, B)
- T: terminals (symbols such as a, b, 0, 1)
- P: productions (rewrite rules)
- S: start symbol

Common notation accepted by this app:

- Arrow forms: ->, =>, or ->
- Alternatives with pipe: S->aS|b
- Multiple rules separated by newline, comma, or semicolon
- Epsilon supported as empty string token (for example e, eps, epsilon, or epsilon symbol)

## Chomsky Types Covered

### Type 3: Regular Grammar

- Rule style: left-linear or right-linear (not mixed)
- Typical form: A->aB or A->a or A->epsilon
- Equivalent machine: Finite Automaton (NFA and DFA)

### Type 2: Context-Free Grammar

- Rule style: single non-terminal on left side
- Typical form: A->alpha where A is one variable
- Equivalent machine: Pushdown Automaton (PDA)

### Type 1: Context-Sensitive Grammar

- Rule style: non-shrinking productions (with standard epsilon exception)
- Constraint idea: |lhs| <= |rhs| for most rules
- Equivalent machine: Linear Bounded Automaton (LBA)

### Type 0: Unrestricted Grammar

- Most general production system
- Equivalent machine: Turing Machine

## What the Web App Does

### Home / Landing

- Introduces the tool and navigation to learning and simulation sections

### Explore Page

- Shows each hierarchy layer with readable explanations
- Includes grammar form, automaton mapping, examples, and key notes
- Helps beginners connect theory terms to practical patterns

### Simulator Page

- Accepts one grammar input
- Classifies grammar type (Type 0 to Type 3)
- Shows reasoning and violations when stricter conditions fail
- Renders:
  - Parse tree
  - NFA graph
  - DFA graph
  - Transition tables
  - Derivation paths
  - Example strings
  - Closure properties

### Compare Page

- Supports side-by-side conceptual understanding of hierarchy levels

## Automata Logic Implemented

For regular grammars, the backend constructs automata and exposes them to the frontend renderer.

- NFA construction includes epsilon transitions where required
- DFA construction uses epsilon-closure and move over NFA state sets
- DFA states are canonicalized set-representations to ensure deterministic transitions

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, D3
- Backend: Node.js, Express

## Project Structure

- frontend/: Next.js UI and visualization components
- server/: Express routes, controllers, and grammar/classifier services

## Prerequisites

- Node.js 18 or higher (20+ recommended)
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

### Start frontend (port 3000, or 3001 if 3000 is busy)

```bash
cd frontend
npm run dev
```

Open:

- http://localhost:3000/simulator
- or http://localhost:3001/simulator

## API Endpoints

Base URL: http://localhost:4000/api

- GET /health
- GET /hierarchy
- GET /type/:id
- GET /explore-content
- POST /simulate
- POST /classify

### Example classify request

```json
{
  "grammar": "S->aS|b"
}
```

### Example classify response fields (high level)

- type, typeNumber, reason
- checksPassed, violations
- visualizations.parseTree
- visualizations.nfa
- visualizations.dfa
- nfaTable, dfaTable
- derivationSteps, exampleStrings

## Input Tips

- Keep non-terminals uppercase (S, A, B)
- Keep terminals lowercase or digits (a, b, 0, 1)
- Use compact grammar rules for best results
- If server output looks stale, restart backend and refresh browser

## Notes

- Frontend API base is read from NEXT_PUBLIC_API_URL.
- Default API target is http://localhost:4000/api.

## Step-by-Step Deployment on Vercel

This repository has two parts:

- frontend app in frontend/ (Next.js)
- backend API in server/ (Express)

Vercel should deploy the frontend app. Backend can be hosted separately (Render, Railway, or another Node host), then connected using NEXT_PUBLIC_API_URL.

### 1. Validate locally first

Run from frontend folder:

```bash
cd frontend
npm install
npm run build
```

If this build fails locally, deployment will fail in Vercel.

### 2. Prepare environment variables

Use frontend/.env.example as template.

In Vercel Project Settings, add:

- NEXT_PUBLIC_API_URL = https://your-backend-domain.com/api

Do not use localhost in production environment variables.

### 3. Import project in Vercel

- Click New Project
- Import this GitHub repository
- Set Root Directory to frontend
- Framework Preset should be Next.js

### 4. Verify build settings

- Build Command: npm run build
- Install Command: npm install
- Output: .next (auto for Next.js)
- Node version: read from frontend/package.json engines

### 5. Deploy

After deploy, open the Vercel URL and test Simulator page.

### 6. If deployment fails, check logs directly

Go to Vercel Deployments logs and match the exact error.

Most common causes:

- Missing NEXT_PUBLIC_API_URL
- Wrong import case sensitivity (Linux is case-sensitive)
- Building wrong folder instead of frontend
- Backend URL still pointing to localhost
