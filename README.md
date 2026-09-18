# EduAgent Connect

A prototype demonstrating how an education website can become **Agent Ready**
using a **WebMCP-style capability layer**.

> Prototype using **synthetic education data** only. It does **not** scrape,
> modify, or integrate with any production system.

## What it demonstrates

A single end-to-end learner journey, exposed both as UI and as typed,
permissioned capabilities an agent can call:

`learner request → course discovery → course details → course comparison →
enquiry preparation → enquiry validation → explicit human confirmation →
enquiry submission → submission status`

Write actions (enquiry submission) always require **explicit human
confirmation**, and the backend **independently validates** every write.

> Status: **Specification 01 — Foundation implemented.** The website shell,
> navigation, backend API foundation, and health endpoint are in place. No
> course/enquiry business features are implemented yet — those arrive with later
> specifications (Course Catalogue is Specification 02).
>
> **WebMCP is a future capability and is not implemented.** The client ships a
> typed capability *abstraction* used today only as a transport boundary; no
> agent tools, agent, or AI integration exist.

## Tech stack

| Layer      | Stack                                                    |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js (App Router), React, TypeScript, Tailwind CSS    |
| Backend    | Node.js, Express, TypeScript, REST APIs                  |
| Validation | Zod (backend input + env; client capability schemas)     |
| Security   | Helmet, CORS                                             |
| Logging    | Pino (structured request/startup logs)                   |
| Tooling    | ESLint, Prettier                                         |
| Deploy     | Vercel                                                   |

## Repository structure

```
App/
├── client/     # Next.js frontend (website shell + navigation)
│   └── src/
│       ├── app/            # App Router: layout (shell), home, and section pages
│       │                   #   (education, admissions, lifelong-learning,
│       │                   #    industry, about)
│       ├── components/     # layout shell (Header/Navigation/Footer/PageContainer)
│       │                   #   and UI primitives (Button/Card/Container)
│       ├── config/         # navigation (single source of nav items)
│       └── lib/webmcp/     # Typed capability abstraction + transport adapter
├── server/     # Express REST API — owns ALL business logic
│   └── src/
│       ├── index.ts        # bootstrap + graceful shutdown
│       ├── app.ts          # Express composition (Helmet, CORS, Pino, routes, errors)
│       ├── routes/         # HTTP routing (health)
│       ├── http/           # error taxonomy, error handler, Zod validation boundary
│       ├── config/         # Zod-validated env + Pino logger
│       ├── controllers/    # HTTP boundary (placeholder; filled by later specs)
│       ├── services/       # business logic (placeholder; filled by later specs)
│       ├── repositories/   # data access (placeholder; filled by later specs)
│       └── data/           # synthetic data (placeholder; filled by later specs)
└── docs/       # Documentation
.kiro/
├── steering/   # Kiro steering: product, architecture, coding-standards,
│               # security, testing
└── specs/      # 01-foundation (this), 02-course-catalogue (specified, not built)
```

## Prerequisites

- Node.js **>= 20** (developed on Node 24)
- npm (developed on npm 11)

## Getting started

All commands run from the `App/` directory (npm workspaces root).

```bash
cd App
npm install

# copy environment examples
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# run client (:3000) and server (:4000) together
npm run dev
```

Then:

- API health: <http://localhost:4000/api/health>
- App: <http://localhost:3000> (the website shell with navigation across Home,
  Education, Admissions, Lifelong Learning, Industry, and About; the home page
  shows a live backend health indicator)

### Individual services

```bash
npm run dev:server   # Express on :4000
npm run dev:client   # Next.js on :3000
```

### Quality gates

```bash
npm run typecheck    # strict TypeScript, both workspaces
npm run lint         # ESLint, both workspaces
npm run format       # Prettier — write
npm run format:check # Prettier — verify
npm run build        # build server then client
```

## The WebMCP capability layer (foundation only)

> WebMCP itself is **not implemented**. Specification 01 ships only the typed
> *abstraction* and a transport boundary. No agent tools, tool registry wiring,
> AI agent, or AI integration exist. Future agent tools will **reuse** the
> backend business capabilities rather than duplicating them.

Provided as a **typed capability abstraction/registry** (`client/src/lib/webmcp`),
independent of any specific browser API:

- **Typed capabilities** with Zod input/output schemas.
- **Explicit permissions** per capability: operation `kind`,
  `requiresHumanConfirmation`, and `scopes`.
- **READ / NAVIGATION / WRITE** operations are distinguishable.
- **Human-in-the-loop**: the registry requests explicit confirmation before any
  capability that requires it executes (e.g. enquiry submission).
- **Browser specifics behind an adapter**: a `fetch`-based transport implements
  the transport interface, so the layer never touches `window`/`fetch` directly
  and can be swapped for tests or a future real WebMCP binding.

Capabilities **do not** contain business logic — they validate, enforce
permissions, and delegate to the backend, which is the source of truth.

## Architectural rules

1. Business logic lives in backend services.
2. WebMCP capabilities never duplicate business logic.
3. WebMCP is a typed capability abstraction/registry (not tied to a browser API).
4. Browser-specific WebMCP code stays behind an adapter.
5. Agent tools declare explicit permissions.
6. READ, NAVIGATION and WRITE are distinguishable.
7. Enquiry submission requires explicit human confirmation.
8. The backend independently validates every write.
9. Synthetic education data only.
10. No integration with Republic Polytechnic (or any) production systems.
11. No auth or database until a later spec requires it.
12. TypeScript strict mode.
13. Zod for API/input validation.
14. No unnecessary dependencies.

## Documentation

- `.kiro/steering/` — product, architecture, coding standards, security, testing.
- `App/docs/` — additional project documentation.

## License

Prototype for demonstration/education purposes.
