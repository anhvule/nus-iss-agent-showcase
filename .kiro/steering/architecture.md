# Architecture — EduAgent Connect

## Repository layout

```
App/
├── client/     # Next.js + React + TypeScript + Tailwind (frontend + WebMCP layer)
├── server/     # Node.js + Express + TypeScript REST API (all business logic)
└── docs/        # Project documentation
.kiro/           # Kiro steering (this folder) and future specs
```

`App/` is an npm workspaces monorepo (`client`, `server`). The root
`App/package.json` provides orchestration scripts (`dev`, `build`, `typecheck`,
`lint`).

## Layers

### Backend (`App/server`) — the source of truth

- Owns **all business logic**. Rule: business logic belongs in backend services,
  never in the frontend, and never in WebMCP tools.
- Exposes **REST APIs**. Current foundation exposes `GET /api/health` only.
- **Independently validates every write operation** with Zod, regardless of any
  client-side validation. The client is never trusted.
- Structure:
  - `src/index.ts` — process bootstrap + graceful shutdown.
  - `src/app.ts` — the single Express composition point (middleware, routes,
    error handling). Route handlers stay thin; logic lives in service modules
    (added by later specs).
  - `src/routes/*` — HTTP routing only.
  - `src/config/env.ts` — Zod-validated environment configuration.

### Frontend (`App/client`) — UI + WebMCP capability layer

- Next.js App Router (`src/app`). React with strict mode.
- Hosts the **WebMCP capability layer** at `src/lib/webmcp/`.

## WebMCP capability layer (the core abstraction)

WebMCP is implemented initially as a **typed capability abstraction/registry**,
not as a browser API dependency. Design rules:

1. **No duplicated business logic.** Capabilities describe and dispatch; they
   call the backend via a transport. The backend holds the logic.
2. **Typed and validated.** Each capability declares Zod input/output schemas
   (`CapabilityDefinition` in `types.ts`).
3. **Explicit permissions.** Every capability declares `CapabilityPermissions`:
   its `kind`, whether it `requiresHumanConfirmation`, and its `scopes`. No
   ambient authority.
4. **READ / NAVIGATION / WRITE are distinguishable** via `CapabilityKind`.
5. **Human confirmation for writes.** The registry (`registry.ts`) requests
   explicit human confirmation before executing any capability whose permissions
   require it. Enquiry submission MUST require confirmation.
6. **Browser specifics live behind an adapter.** `adapter.ts` provides a
   `fetch`-based `CapabilityTransport`. The capability layer never touches
   `window`/`fetch`/`document` directly, so the transport can be swapped for
   tests or a future real WebMCP browser binding.

### Execution pipeline (enforced by `CapabilityRegistry.invoke`)

```
input → validate input (Zod)
      → if requiresHumanConfirmation: ask human, abort if declined
      → execute (delegates to transport → backend)
      → validate output (Zod)
      → return
```

## Data flow

```
Agent / UI → WebMCP capability → CapabilityTransport (adapter)
           → Backend REST API → backend service (business logic + validation)
```

## Deployment

- Target platform: **Vercel**.
- `client` deploys as a Next.js app. `server` is an Express API (deployed as a
  separate service / serverless functions as a later spec defines).
- `NEXT_PUBLIC_API_BASE_URL` points the client at the backend.

## Constraints

- TypeScript **strict mode** everywhere.
- **Zod** for all API/input validation.
- **No unnecessary dependencies.** Prefer the standard library and already-present
  packages.
- No database or auth until a later spec requires it.
