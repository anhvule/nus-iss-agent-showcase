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

> Status: **repository foundation only.** No course/enquiry business features are
> implemented yet.

## Tech stack

| Layer     | Stack                                             |
| --------- | ------------------------------------------------- |
| Frontend  | Next.js, React, TypeScript, Tailwind CSS          |
| Backend   | Node.js, Express, TypeScript, REST APIs           |
| Validation| Zod (client capability schemas + backend input)   |
| Deploy    | Vercel                                            |

## Repository structure

```
App/
├── client/     # Next.js frontend + WebMCP capability layer
│   └── src/
│       ├── app/            # App Router (layout, landing page, styles)
│       └── lib/webmcp/     # Typed capability abstraction/registry + adapter
├── server/     # Express REST API — owns ALL business logic
│   └── src/
│       ├── index.ts        # bootstrap
│       ├── app.ts          # Express composition (middleware, routes, errors)
│       ├── routes/         # HTTP routing (health)
│       └── config/         # Zod-validated env
└── docs/       # Documentation
.kiro/
└── steering/   # Kiro steering: product, architecture, coding-standards,
                # security, testing
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
- App: <http://localhost:3000> (the landing page shows the backend health)

### Individual services

```bash
npm run dev:server   # Express on :4000
npm run dev:client   # Next.js on :3000
```

### Quality gates

```bash
npm run typecheck    # strict TypeScript, both workspaces
npm run lint         # ESLint, both workspaces
npm run build        # build server then client
```

## The WebMCP capability layer

Implemented as a **typed capability abstraction/registry** (`client/src/lib/webmcp`),
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
