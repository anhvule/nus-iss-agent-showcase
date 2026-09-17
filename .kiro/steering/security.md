# Security — EduAgent Connect

## Trust model

- The **backend is the trust boundary**. It owns business logic and must
  **independently validate every write operation** with Zod, regardless of any
  client-side checks. Treat all client input, and all agent-supplied input, as
  untrusted.
- The frontend and the WebMCP capability layer are **not** trusted to enforce
  business rules. They improve UX and structure; they never replace backend
  validation.

## Agent safety rules

- **Explicit permissions.** Every WebMCP capability declares its `kind`, whether
  it `requiresHumanConfirmation`, and its `scopes`. There is no ambient
  authority — a capability can only do what it declares.
- **READ / NAVIGATION / WRITE distinction.** Side-effecting WRITE operations are
  clearly separated from safe READs and NAVIGATION so agents cannot mutate state
  while appearing to "just read".
- **Human-in-the-loop for writes.** Enquiry submission (and any WRITE that sends
  data) **MUST require explicit human confirmation** before execution. The
  registry enforces this in `CapabilityRegistry.invoke` before calling the
  backend. A declined confirmation aborts with `ConfirmationDeniedError`.
- **No speculative writes.** Agents may call READ capabilities freely but must
  never trigger a WRITE without a confirmed human decision.

## Data & integrations

- **Synthetic data only.** Do not use real learner PII.
- **Do not scrape, modify, or integrate with Republic Polytechnic production
  systems**, or any external production system.
- No outbound requests that transmit project data to third parties.

## Configuration & secrets

- Configuration flows through Zod-validated env parsing (`server/src/config/env.ts`).
- Never commit `.env` / `.env.local`; only `.env.example` is committed.
- No secrets are required by the foundation (no auth, no database). If a later
  spec introduces them, store them in environment variables and document in
  `.env.example` by key name only.

## Transport & CORS

- CORS origins are configurable via `CORS_ORIGIN`. Use a specific allow-list in
  anything beyond local prototyping; `*` is for local development only.
- Client → backend calls go through the transport adapter over HTTP(S). HTTPS is
  expected in deployed environments.

## Input handling

- Validate request bodies and query params with Zod at the route boundary.
- Return generic error messages to clients; log details server-side only.

## Known advisories (foundation)

- `npm audit` reports advisories in **postcss bundled inside Next.js's own
  dependency tree** (`node_modules/next/node_modules/postcss`). These are
  build-time/dev tooling and are only resolvable via a Next.js **major** upgrade
  (breaking). They are intentionally **not** patched in the foundation to avoid a
  breaking change; revisit when upgrading Next.js.
- Direct dependencies are pinned; `next` and `express` were bumped to patched
  releases (`next@14.2.35`, `express@4.22.3`) during setup.

## Dependency hygiene

- Pin dependencies to exact versions. Avoid unnecessary or unfamiliar packages
  (typosquatting risk). Review advisories on each dependency change.
