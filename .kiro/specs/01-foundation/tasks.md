# Specification 01 — Foundation · Tasks

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 01-foundation
**Traceability:** Each task references requirements in `./requirements.md` and design sections in `./design.md`.

Priority values: **High** · **Medium** · **Low**.
Tasks are intentionally small so each can be implemented and verified independently.

---

## PHASE 1 — Repository Setup

### TASK-001
Priority: High
Dependency: none
Description: Establish the mandatory monorepo structure with `client`, `server`, and `docs` as siblings under `App/`, and `.kiro/` at the workspace root. Ensure no nested `client/server` exists.
Expected Outcome: Directory layout matches design §4; satisfies FR-001, FR-004; verifiable by AC-01.

### TASK-002
Priority: High
Dependency: TASK-001
Description: Configure npm workspaces at `App/package.json` for `client` and `server`, with root orchestration scripts (`dev`, `build`, `typecheck`, `lint`, plus per-workspace variants).
Expected Outcome: `npm install` at `App/` resolves both workspaces; root scripts run each workspace. Satisfies FR-002, FR-003.

### TASK-003
Priority: High
Dependency: TASK-001
Description: Add root `.gitignore` covering `node_modules`, build outputs, and env files; ensure real `.env`/`.env.local` are ignored while `.env.example` is tracked.
Expected Outcome: No secrets or build artefacts are committable. Supports FR-024, NFR-007.

---

## PHASE 2 — Frontend Foundation

### TASK-010
Priority: High
Dependency: TASK-002
Description: Initialize the Next.js (App Router) client in `App/client` with React and TypeScript **strict mode**; configure the `@/*` path alias.
Expected Outcome: Client compiles under strict TS. Satisfies FR-005, FR-006, NFR-002.

### TASK-011
Priority: High
Dependency: TASK-010
Description: Add and configure Tailwind CSS (config, PostCSS, global stylesheet) with a shared theme.
Expected Outcome: Tailwind utilities render; shared theme available. Satisfies FR-007.

### TASK-012
Priority: High
Dependency: TASK-011
Description: Build the website shell layout: `Header`, `Navigation`, `PageContainer`, `Footer` using semantic landmarks.
Expected Outcome: Consistent shell wraps all pages with `header`/`nav`/`main`/`footer` landmarks. Satisfies FR-008; supports FR-013.

### TASK-013
Priority: High
Dependency: TASK-012
Description: Create placeholder routes and client-side navigation for Home, Education, Admissions, Lifelong Learning, Industry, About. Indicate the current page.
Expected Outcome: All six sections route client-side without full reload. Satisfies FR-009, FR-010; verifiable by AC-04.

### TASK-014
Priority: Medium
Dependency: TASK-011
Description: Implement baseline UI primitives — typography scale, `Button`, `Card`, `Container` — as presentation-only components (no business logic).
Expected Outcome: Reusable primitives available to later specs. Satisfies FR-011.

### TASK-015
Priority: Medium
Dependency: TASK-012, TASK-014
Description: Apply responsive layout (≥320 px to desktop) and the accessibility baseline (focus states, labelled controls, contrast, landmarks).
Expected Outcome: Usable across breakpoints and keyboard-operable. Satisfies FR-012, FR-013, NFR-010, NFR-011; verifiable by AC-05.

### TASK-016
Priority: Medium
Dependency: TASK-010
Description: Wire the client to read `NEXT_PUBLIC_API_BASE_URL`; add a small health indicator that reads the backend health endpoint through a transport boundary (no secrets in client).
Expected Outcome: Client resolves API base URL from env and can display backend health. Satisfies FR-014; supports AC-06, AR-006.

---

## PHASE 3 — Backend Foundation

### TASK-020
Priority: High
Dependency: TASK-002
Description: Initialize the Express app in `App/server` with TypeScript **strict mode**, a bootstrap entry, and graceful startup/shutdown on SIGINT/SIGTERM.
Expected Outcome: Server starts deterministically and shuts down cleanly. Satisfies FR-015, NFR-013; verifiable by AC-13.

### TASK-021
Priority: High
Dependency: TASK-020
Description: Establish the layered structure Routes → Controllers → Services → Repositories, plus a synthetic-data location. No business feature implemented; provide the skeleton and conventions.
Expected Outcome: Layer folders/interfaces exist with business logic slotted for Services. Satisfies FR-018, AR-001, AR-002, AR-007; verifiable by AC-08.

### TASK-022
Priority: High
Dependency: TASK-020
Description: Implement `GET /api/health` returning `{ status, service, version, uptimeSeconds, timestamp }` under the versioned `/api` base path.
Expected Outcome: Health endpoint returns HTTP 200 with the specified payload. Satisfies FR-016, FR-017; verifiable by AC-06.

### TASK-023
Priority: High
Dependency: TASK-020
Description: Add Zod-validated environment configuration (`NODE_ENV`, `PORT`, `CORS_ORIGIN`) that fails fast on invalid config.
Expected Outcome: Startup rejects invalid config with a clear message. Satisfies FR-021 (env portion), NFR-013; supports AC-13.

### TASK-024
Priority: High
Dependency: TASK-022
Description: Add the centralised error-handling foundation: structured 404 for unknown routes and a sanitised 500 handler that leaks no internals.
Expected Outcome: Unknown routes and thrown errors produce sanitised JSON. Satisfies FR-019, FR-020; verifiable by AC-07.

### TASK-025
Priority: High
Dependency: TASK-020
Description: Add security middleware: Helmet for hardened headers and CORS restricted to a configurable allow-list (wildcard only in development).
Expected Outcome: Responses carry Helmet headers; CORS enforces the allow-list. Satisfies FR-022, NFR-004, NFR-005; part of AC-09.

### TASK-026
Priority: High
Dependency: TASK-021
Description: Add a Zod validation boundary in Controllers for body/query/params, returning sanitised errors on invalid input.
Expected Outcome: Malformed input is rejected before reaching Services. Satisfies FR-021, NFR-006; part of AC-09.

### TASK-027
Priority: Medium
Dependency: TASK-020
Description: Add structured logging with Pino for startup and per-request lifecycle (method, path, status, duration), correlation-ready, with no secrets/PII.
Expected Outcome: JSON logs emitted per request without sensitive data. Satisfies FR-023, NFR-008; part of AC-09.

### TASK-028
Priority: Medium
Dependency: TASK-003, TASK-023
Description: Provide `.env.example` for both `client` and `server` documenting all recognised variables by key.
Expected Outcome: Example env files exist; no real env committed. Satisfies FR-024, NFR-007; verifiable by AC-10.

---

## PHASE 4 — Developer Tooling

### TASK-030
Priority: High
Dependency: TASK-010, TASK-020
Description: Configure ESLint for both workspaces (Next.js config for client; TypeScript ESLint for server) targeting zero warnings.
Expected Outcome: `npm run lint` passes cleanly for both workspaces. Satisfies NFR-001; part of AC-02.

### TASK-031
Priority: Medium
Dependency: TASK-030
Description: Configure Prettier with a shared style and ensure it does not conflict with ESLint.
Expected Outcome: Consistent formatting; format check passes. Satisfies NFR-001.

### TASK-032
Priority: High
Dependency: TASK-010, TASK-020
Description: Ensure strict `tsconfig` for both workspaces and root `typecheck` scripts.
Expected Outcome: `npm run typecheck` passes with zero errors for both workspaces. Satisfies NFR-002; part of AC-02.

---

## PHASE 5 — Documentation

### TASK-040
Priority: High
Dependency: TASK-002
Description: Write the root README: project intent, stack, mandatory structure, setup/run instructions, and the synthetic-data / no-RP-integration guardrails.
Expected Outcome: A stakeholder can set up and run the project from the README. Satisfies FR-025; part of AC-12.

### TASK-041
Priority: Medium
Dependency: TASK-040
Description: Add `App/docs` documentation entry pointing to steering and this spec, and summarising the RP-to-Agent-Ready transformation model.
Expected Outcome: Documentation foundation exists and explains the transformation. Satisfies FR-025, NFR-015; part of AC-12.

### TASK-042
Priority: Medium
Dependency: none
Description: Confirm the agent-readiness architecture (READ/NAVIGATION/WRITE permissions, human-confirmation seam, WebMCP integration boundary behind an adapter, independently testable capabilities, layer separation) is documented in design and steering.
Expected Outcome: Architecture documentation satisfies AR-003–AR-007; verifiable by AC-11.

---

## PHASE 6 — Validation

### TASK-050
Priority: High
Dependency: TASK-032, TASK-030
Description: Run `npm run typecheck` and `npm run lint` across both workspaces and resolve any issues.
Expected Outcome: Both pass with zero errors/warnings. Verifies AC-02.

### TASK-051
Priority: High
Dependency: TASK-010–TASK-016, TASK-020–TASK-028
Description: Run `npm run build` for both workspaces.
Expected Outcome: Client and server build successfully. Verifies AC-03.

### TASK-052
Priority: High
Dependency: TASK-022, TASK-024, TASK-025, TASK-027
Description: Boot the backend and verify `GET /api/health` returns the specified payload, unknown routes return structured 404, Helmet headers are present, and logs are structured.
Expected Outcome: Health, 404, headers, and logging behave as specified. Verifies AC-06, AC-07, AC-09.

### TASK-053
Priority: High
Dependency: TASK-012, TASK-013, TASK-015
Description: Boot the frontend and verify the shell renders, all six navigation sections route client-side, and the responsive/accessibility baseline holds.
Expected Outcome: Website shell and navigation verified across breakpoints with keyboard operability. Verifies AC-04, AC-05.

### TASK-054
Priority: Medium
Dependency: TASK-023
Description: Verify configuration fail-fast and graceful shutdown (invalid env rejected at startup; SIGINT/SIGTERM shut down cleanly).
Expected Outcome: Deterministic startup/shutdown confirmed. Verifies AC-13.

### TASK-055
Priority: Medium
Dependency: TASK-050–TASK-054
Description: Confirm no out-of-scope functionality (§4.2 of requirements) has been introduced, and check the Definition of Done checklist.
Expected Outcome: All DoD items satisfied; scope boundary intact.

---

## Traceability Summary

| Requirement(s) | Design section(s) | Task(s) |
| -------------- | ----------------- | ------- |
| FR-001, FR-004 | §4 | TASK-001 |
| FR-002, FR-003 | §4 | TASK-002 |
| FR-005, FR-006 | §5 | TASK-010, TASK-032 |
| FR-007 | §5 | TASK-011 |
| FR-008 | §5 | TASK-012 |
| FR-009, FR-010 | §5 | TASK-013 |
| FR-011 | §5 | TASK-014 |
| FR-012, FR-013 | §5 | TASK-012, TASK-015 |
| FR-014 | §5, §8 | TASK-016, TASK-028 |
| FR-015 | §6 | TASK-020 |
| FR-016, FR-017 | §7 | TASK-022 |
| FR-018 | §6 | TASK-021 |
| FR-019, FR-020 | §9 | TASK-024 |
| FR-021 | §7, §8, §11 | TASK-023, TASK-026 |
| FR-022 | §11 | TASK-025 |
| FR-023 | §10 | TASK-027 |
| FR-024 | §8 | TASK-003, TASK-028 |
| FR-025 | §1, §16 | TASK-040, TASK-041 |
| AR-001, AR-002, AR-007 | §6, §13 | TASK-021, TASK-042 |
| AR-003, AR-004, AR-005, AR-006 | §13, §14 | TASK-042 (+ enabled by TASK-016, TASK-021) |
| NFR-001 | §12, §17 | TASK-030, TASK-031 |
| NFR-002 | §17 | TASK-032 |
| NFR-003 | §12 | TASK-021 (design), TASK-016 |
| NFR-004, NFR-005 | §11 | TASK-025 |
| NFR-006 | §11 | TASK-026 |
| NFR-007 | §8, §11 | TASK-003, TASK-028 |
| NFR-008 | §10 | TASK-027 |
| NFR-009 | §5, §7 | TASK-051, TASK-052 |
| NFR-010, NFR-011 | §5 | TASK-015 |
| NFR-012 | §4, §17 | TASK-040 (documented); operationalised in Spec 08 |
| NFR-013 | §8 | TASK-020, TASK-023, TASK-054 |
| NFR-014 | §6, §13 | TASK-021, TASK-042 |
| NFR-015 | §17 | TASK-041, TASK-042 |
