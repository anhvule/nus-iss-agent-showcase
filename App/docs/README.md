# EduAgent Connect — Documentation

This folder holds project documentation that complements the Kiro steering files
in `.kiro/steering/`.

## Where things live

- **Product intent & journey** → `.kiro/steering/product.md`
- **Architecture & WebMCP layer** → `.kiro/steering/architecture.md`
- **Coding standards** → `.kiro/steering/coding-standards.md`
- **Security & agent safety** → `.kiro/steering/security.md`
- **Testing approach & verification gates** → `.kiro/steering/testing.md`

## Foundation status

The repository currently contains the **foundation only**:

- npm workspaces monorepo under `App/` (`client`, `server`).
- Backend: Express + TypeScript (strict) + Zod, exposing `GET /api/health`.
- Frontend: Next.js (App Router) + React + Tailwind, with the WebMCP capability
  layer (`client/src/lib/webmcp`) and a landing page that reports backend health.

No course catalogue, comparison, or enquiry business features are implemented
yet. Those are introduced incrementally through specifications.

## Adding documentation

As specifications are implemented, capture design notes, API contracts, and
decision records here. Prefer linking to the authoritative steering files rather
than duplicating their content.
