# Coding Standards — EduAgent Connect

## Language & typing

- **TypeScript strict mode** is mandatory in both `client` and `server`.
  Additional strictness enabled: `noUncheckedIndexedAccess`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`, and (server)
  `exactOptionalPropertyTypes`.
- Do not use `any`. Prefer precise types, `unknown` with narrowing, or generics.
- Avoid non-null assertions (`!`) except where provably safe and commented.
- Model absent values explicitly (discriminated unions over loose optionals for
  state, e.g. the `HealthState` pattern on the landing page).

## Validation

- Use **Zod** for all external input: HTTP request bodies/queries, environment
  variables, and WebMCP capability input/output.
- The backend **must** validate every write independently, even if the client
  already validated. Never trust client input.

## Module conventions

- **Server** uses `NodeNext` module resolution: relative imports **must** include
  the `.js` extension (e.g. `import { createApp } from './app.js'`).
- **Client** uses the `@/*` path alias mapped to `src/*`.
- Keep barrels (`index.ts`) for the WebMCP layer; import from `@/lib/webmcp`.

## Structure & separation

- **Business logic lives in backend services**, not in routes, not in the
  frontend, not in WebMCP capabilities.
- Route handlers are thin: parse/validate → call service → shape response.
- WebMCP capabilities describe permissions + schemas and delegate execution to
  the transport. They must not embed domain logic.

## Naming

- Capabilities: dotted, lowercase, `domain.action` (e.g. `courses.search`,
  `enquiry.submit`).
- Scopes: `resource:operation` (e.g. `courses:read`, `enquiry:write`).
- Files: kebab-case for multi-word non-component files; PascalCase for React
  components.
- Types/interfaces: PascalCase. Constants: `UPPER_SNAKE` only for true
  compile-time constants.

## React / Next.js

- App Router under `src/app`. Add `'use client'` only to components that need
  browser APIs or state.
- Keep components accessible: semantic elements, `aria-live` for async status,
  label form controls.
- Prefer server components for static content; client components for
  interactivity.

## Formatting & linting

- 2-space indentation, single quotes, trailing commas (multiline), semicolons.
- Lint must pass with zero warnings before a task is considered done
  (`npm run lint`).
- Type-check must pass (`npm run typecheck`).

## Comments

- Explain **why**, not what. Document capability classification and any security
  reasoning inline where it aids future readers.

## Dependencies

- **Do not add dependencies without justification.** Prefer built-ins and
  existing packages. New dependencies should be pinned to exact versions.
