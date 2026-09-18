# EduAgent Connect — Documentation

This folder holds project documentation that complements the Kiro steering files
in `.kiro/steering/`.

## Where things live

- **Product intent & journey** → `.kiro/steering/product.md`
- **Architecture & WebMCP layer** → `.kiro/steering/architecture.md`
- **Coding standards** → `.kiro/steering/coding-standards.md`
- **Security & agent safety** → `.kiro/steering/security.md`
- **Testing approach & verification gates** → `.kiro/steering/testing.md`

## Foundation status — Specification 01 implemented

The repository contains the **implemented foundation** (Specification 01):

- npm workspaces monorepo under `App/` (`client`, `server`), with strict
  TypeScript, ESLint, and Prettier.
- **Backend:** Express + TypeScript (strict) + Zod, with Helmet (security
  headers), CORS (configurable allow-list), and Pino (structured logging).
  Exposes `GET /api/health`. Layered as Routes → Controllers → Services →
  Repositories → Data, with a centralised, sanitised error handler and a reusable
  Zod validation boundary. The Controllers/Services/Repositories/Data layers are
  established as placeholders for later specifications.
- **Frontend:** Next.js (App Router) + React + Tailwind — an original website
  shell (Header, Navigation, Footer, page container) with client-side navigation
  across Home, Education, Admissions, Lifelong Learning, Industry, and About, plus
  reusable UI primitives and a backend health indicator on the home page.

**Agent readiness:** the architecture separates UI → API → Services →
Repositories → Data so future agent tools can reuse the same business
capabilities. **WebMCP is a future capability and is not implemented in
Specification 01** — there are no agent tools, no agent, and no AI integration.

No course catalogue, comparison, or enquiry business features are implemented
yet. The Course Catalogue is specified in `.kiro/specs/02-course-catalogue/` and
is **not** built yet; it is introduced by that specification. All data is
synthetic; there is no Republic Polytechnic (or any) production integration.

## Environment variables

- **Server (server-only):** `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `LOG_LEVEL`
  (see `server/.env.example`). These are never exposed to the browser.
- **Client (public):** `NEXT_PUBLIC_API_BASE_URL` (see `client/.env.example`).
  Only `NEXT_PUBLIC_*` values reach the browser; no secrets are stored client-side.

## Adding documentation

As specifications are implemented, capture design notes, API contracts, and
decision records here. Prefer linking to the authoritative steering files rather
than duplicating their content.
