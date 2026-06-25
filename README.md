# Feature Flag Service — Technical Interview

## Setup

You've been given a starter project with a Python backend (FastAPI) and a React frontend (Vite), wired together with Docker.

### Prerequisites

- **Docker Desktop** installed and running on your machine

### Getting Started

```bash
cd ff-interview-starter
<start git, initializing it with starter code as first commit>
docker compose up --build
```

The first run takes 1–2 minutes to download images and install dependencies. Once you see output like this, you're ready:

```
frontend-1  |   VITE v6.x.x  ready in XXX ms
backend-1   |   INFO:     Application startup complete.
```

### What's Running

| Service  | URL                        | What it is                          |
|----------|----------------------------|-------------------------------------|
| Frontend | http://localhost:5173       | The React app — **open this one**   |
| Backend  | http://localhost:8000/docs  | FastAPI auto-generated API docs     |

You don't need to open `localhost:8000` directly — the frontend already talks to the backend through a proxy. But the `/docs` page is useful for testing your API endpoints as you build them.

### How to Work

- Edit files on your machine in the `backend/` and `frontend/` folders using your normal editor
- Both servers have **hot reload** — save a file and it picks up changes automatically, no restart needed
- If something gets stuck, `Ctrl+C` and `docker compose up` again (no `--build` needed after the first time unless you change dependencies)

### Without Docker

If you don't have Docker, you can run the services directly:

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

If running without Docker, change the fetch URL in `App.jsx` from `"/api/..."` to `"http://localhost:8000/..."`.

---

## The Problem

### Context

You're building a feature for a multi-tenant B2B SaaS platform. The platform serves multiple client organizations ("tenants" — think separate companies that each have their own account). We need a way to control which features are turned on or off for each tenant.

### How Feature Flags Work

A **feature flag** is a simple on/off switch for a product feature. For example:

- `dark_mode` — controls whether the dark mode option is available
- `ai_assistant` — controls whether the AI assistant feature is visible
- `bulk_export` — controls whether users can export data in bulk

Each flag has a **default state** (on or off) that applies to every tenant. But sometimes a specific tenant needs something different from the default. For example:

- `dark_mode` is **off by default** for everyone
- But Acme Corp is beta-testing it, so they've **customized** it to be **on** just for them
- Globex Inc hasn't touched it, so they still get the default (off)

When you look at Acme Corp's flags, you should see that `dark_mode` is on **and** that it's been customized (it's not just the default). When you look at Globex's flags, you should see that `dark_mode` is off **and** that it's just the default (they haven't customized anything).

### What to Build

**Backend — add to `backend/main.py`:**

Build API endpoints for managing feature flags:

- `POST /flags` — Create a new feature flag with a name, description, and default state (on/off)
- `GET /flags` — List all feature flags
- `GET /tenants/{tenant_id}/flags` — Get all flags for a specific tenant showing:
  - The flag's **effective state** (the customized value if the tenant has one, otherwise the default)
  - Whether the tenant has **customized** this flag or is using the **default**
- `PUT /tenants/{tenant_id}/flags/{flag_id}` — Let a tenant customize a flag's state

Store everything in memory (Python dicts/lists) — no database needed.

**Frontend — build in `frontend/src/`:**

Build a UI where you can:

- See the list of tenants (already loaded for you in `App.jsx`)
- Click on a tenant to see their feature flags
- Toggle a flag on/off for that tenant (this calls your API)
- Visually distinguish flags that are using the default vs. flags that have been customized by this tenant

### Reference UI

Open **[reference-ui.html](reference-ui.html)** in your browser to see what the finished UI should look like. You don't need to match the styling — use whatever approach you're comfortable with. The important thing is that the **functional elements** shown in the mockup are present:

- Tenant selector that loads that tenant's flags
- A toggle per flag showing its effective state (on/off)
- A visible distinction between "using default" and "customized" (badge, label, color, opacity — your choice)
- Customized flags show what the default is vs. what the tenant has set (stretch goal)
- A way to reset a customized flag back to default (stretch goal)

---

## What's Already Done for You

The starter code handles all the boring setup so you can focus on the actual problem:

- **FastAPI app** — running with CORS already configured for the frontend
- **4 tenants pre-seeded** — Acme Corp, Globex Inc, Initech LLC, Umbrella Holdings — with a working `GET /tenants` endpoint
- **React app** — loading and displaying the tenant list from the API
- **Vite proxy** — `fetch("/api/tenants")` in React automatically routes to the FastAPI backend
- **Docker Compose** — both services with hot reload

You'll see a comment in `backend/main.py` and `frontend/src/App.jsx` marking where your code goes.

---

## Tips

- Use whatever AI tools you normally use — Claude Code, Cursor, Copilot, ChatGPT, whatever
- You don't need to finish everything — focus on what matters most
- Feel free to add files, restructure the frontend, install additional packages — the starter code is a starting point, not a constraint
