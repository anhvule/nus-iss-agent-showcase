# Specification 01 — Foundation · Requirements

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 01-foundation
**Status:** Draft for implementation
**Related steering:** `.kiro/steering/product.md`, `architecture.md`, `coding-standards.md`, `security.md`, `testing.md`

---

## 1. Purpose

The purpose of Specification 01 is to establish the technical and architectural
foundation on which an **Agent-Ready education website** can be built
incrementally. It delivers a running, verifiable skeleton — frontend shell,
backend API foundation, tooling, configuration, and documentation — plus the
**architectural seams** required to later expose the website's capabilities to AI
agents through a WebMCP capability layer, **without** implementing any course,
enquiry, WebMCP, or agent functionality yet.

This specification is deliberately narrow. It answers one question for every
decision it makes: *"Will this make it easier to expose this website capability
to an AI agent later?"* If yes, it is in scope as a foundation concern. If no, it
is deferred.

## 2. Business Context

Education institutions operate human-oriented websites: prospective learners
browse programmes, read details, compare options, and submit enquiries or
applications through forms. As AI agents become able to act on a user's behalf,
these institutions will want their existing website capabilities to be safely and
controllably reachable by agents — without rebuilding their business systems.

**EduAgent Connect** is an original demonstration website that showcases this
transformation. It uses the information architecture and user journeys of a
public polytechnic website (Republic Polytechnic, `https://www.rp.edu.sg`) purely
as a **functional reference** for how education websites are structured. It does
not copy, scrape, brand, or integrate with that site in any way. All data is
synthetic.

The transformation being demonstrated is:

```
Traditional Education Website
        ↓
Human-oriented website capabilities
        ↓
Reusable application/business services
        ↓
Agent Capability Layer
        ↓
WebMCP
        ↓
AI Agent
        ↓
Natural Language User Task
```

## 3. Problem Being Addressed

Traditional education websites couple business capability (search, compare,
enquire) to human UI. An agent cannot reuse those capabilities because they are
not exposed as structured, permissioned, independently invokable operations. If
an institution bolts an agent on top of scraped HTML or duplicated logic, it
creates fragility, drift, and safety gaps (e.g. an agent submitting a form with
no human confirmation).

Specification 01 addresses the **root cause**: it establishes a layered
architecture where business capability is independent of the UI and reachable
through a stable API, so that both a human UI **and** a future agent capability
layer can consume the *same* business services. It also establishes the safety
primitives (permission classification, human-confirmation seam, validation and
logging boundaries) that later specs will rely on.

## 4. Project Scope

### 4.1 In Scope (this specification)

- Mandatory repository structure (`App/client`, `App/server`, `App/docs`, `.kiro`).
- Frontend initialization: Next.js (App Router) + React + TypeScript + Tailwind.
- Backend initialization: Node.js + Express + TypeScript + REST.
- TypeScript strict mode across both workspaces.
- npm workspace configuration and orchestration scripts.
- Environment configuration and examples (no secrets committed).
- Backend health endpoint and API foundation (versioned base path, JSON shape).
- Error-handling foundation (centralised, sanitised responses).
- Logging foundation (structured logging via Pino).
- Security-middleware foundation (Helmet, CORS, Zod validation boundary).
- Basic education website shell: header, navigation, footer, page container.
- Basic navigation across Home, Education, Admissions, Lifelong Learning,
  Industry, About (placeholder pages only).
- Accessibility and responsive-layout baseline.
- Developer tooling: ESLint, Prettier.
- Documentation foundation (`App/docs`, README, this spec set).
- Agent-readiness **architectural** foundation (layering + seams only).

### 4.2 Out of Scope (deferred to later specifications)

Course catalogue, search, filtering, course details, course comparison, enquiry
workflow, application submission, WebMCP implementation, browser WebMCP
integration, AI model integration, AI agent, agent demo, authentication,
authorization, database/persistence, and any Republic Polytechnic integration,
scraping, API use, production forms, assets, or branding.

## 5. Personas

| ID  | Persona | Description | Foundation-relevant need |
| --- | ------- | ----------- | ------------------------ |
| P1  | Prospective Learner (Human) | A working professional in Singapore exploring lifelong-learning courses. Uses the website UI directly. | A fast, accessible, responsive website shell they can navigate. |
| P2  | AI Agent (Future) | An agent acting on a learner's behalf via natural language. Will call capabilities through WebMCP in a later spec. | Business capabilities reachable as structured, permissioned operations — enabled by this foundation's layering. |
| P3  | Developer / Implementer | Builds later specifications on top of this foundation. | Clear structure, strict typing, tooling, and documented seams. |
| P4  | Solution Architect / Stakeholder | Evaluates whether the transformation approach is sound. | A demonstrable, well-documented architecture proving the human and agent paths share one business layer. |
| P5  | Security / Compliance Reviewer | Assesses safety of exposing capabilities to agents. | Explicit permission model, human-confirmation seam, validation and logging boundaries. |

## 6. Functional Requirements

Requirements use EARS-style phrasing where appropriate
(*ubiquitous* — "The system shall …"; *event-driven* — "When …, the system
shall …"; *state-driven* — "While …, the system shall …").

### Repository & Workspace

- **FR-001** The repository shall use the mandatory structure with `client`,
  `server`, and `docs` as siblings under `App/`, and `.kiro/` at the workspace
  root.
- **FR-002** The system shall configure `client` and `server` as npm workspaces
  managed from a single `App/package.json` root.
- **FR-003** The root workspace shall provide orchestration scripts to run,
  build, type-check, and lint both workspaces (individually and together).
- **FR-004** The system shall not create a nested `client/server` directory; the
  frontend and backend shall remain siblings.

### Frontend Foundation

- **FR-005** The frontend shall be a Next.js application using the App Router.
- **FR-006** The frontend shall be written in TypeScript with strict mode enabled.
- **FR-007** The frontend shall use Tailwind CSS for styling via a shared theme.
- **FR-008** The frontend shall provide a reusable layout composed of a header,
  primary navigation, page container, and footer.
- **FR-009** The frontend shall present top-level navigation for Home, Education,
  Admissions, Lifelong Learning, Industry, and About as placeholder pages.
- **FR-010** When a learner selects a navigation item, the system shall route to
  the corresponding placeholder page without a full page reload.
- **FR-011** The frontend shall provide baseline UI primitives (typography scale,
  button, card, container) for reuse by later specifications.
- **FR-012** The frontend shall render responsively across mobile, tablet, and
  desktop breakpoints.
- **FR-013** While rendering interactive UI, the system shall meet an
  accessibility baseline (semantic landmarks, keyboard focus, labelled controls,
  sufficient contrast).
- **FR-014** The frontend shall read its backend base URL from a public
  environment variable and shall contain no secrets.

### Backend Foundation

- **FR-015** The backend shall be an Express application written in TypeScript
  with strict mode enabled.
- **FR-016** The backend shall expose a health endpoint that returns service
  status, service name, version, uptime, and timestamp as JSON.
- **FR-017** The backend shall expose all endpoints under a versioned API base
  path (e.g. `/api`).
- **FR-018** The backend shall be organised as Routes → Controllers → Services →
  Repositories, with an explicit place for synthetic data, even though no
  business feature is implemented yet.
- **FR-019** When an unknown route is requested, the system shall respond with a
  structured `404` payload.
- **FR-020** When a handler throws, the centralised error handler shall respond
  with a sanitised error payload and shall not leak internal details.

### Cross-cutting Foundation

- **FR-021** The backend shall validate all external input (body, query, params)
  at the boundary using Zod, including the environment configuration at startup.
- **FR-022** The backend shall apply security middleware (Helmet and CORS) to all
  responses, with CORS origins configurable via environment.
- **FR-023** The backend shall emit structured logs (via Pino) for startup and
  per-request lifecycle, with no secrets or PII in log output.
- **FR-024** The system shall provide `.env.example` files for both workspaces and
  shall never commit real `.env`/`.env.local` files.
- **FR-025** The documentation foundation shall include a root README and an
  `App/docs` entry describing structure, setup, and the transformation model.

## 7. Agent Readiness Requirements

These requirements establish the **architecture and seams** only. No agent,
WebMCP tool, or capability handler is implemented in this specification.

- **AR-001** Business capabilities shall be implemented independently of UI
  components (in backend services), so they are not coupled to any rendering
  concern.
- **AR-002** The architecture shall ensure future AI agent tools can reuse the
  **same** business capabilities used by the human website, with no duplicated
  business logic.
- **AR-003** Agent operations shall carry explicit permission classifications
  drawn from a fixed set: **READ**, **NAVIGATION**, **WRITE**. The foundation
  shall define this classification so later capabilities can adopt it.
- **AR-004** The architecture shall provide a seam for future WRITE operations to
  require **explicit human confirmation** before execution.
- **AR-005** The architecture shall allow a future WebMCP layer to be integrated
  **without rewriting the business layer** (WebMCP as an integration boundary,
  not a logic layer).
- **AR-006** Agent capabilities shall be designed to be **independently testable**
  (invokable without a browser, with a substitutable transport/boundary).
- **AR-007** The architecture shall clearly separate the layers: **UI → Agent
  Capability Layer → API → Business Services → Repository → Data**, keeping
  WebMCP-/browser-specific concerns behind an adapter.

## 8. Non-Functional Requirements

- **NFR-001 (Maintainability)** The codebase shall enforce a consistent style via
  ESLint and Prettier; lint shall pass with zero warnings.
- **NFR-002 (Type Safety)** Both workspaces shall compile under TypeScript strict
  mode with zero type errors.
- **NFR-003 (Testability)** The architecture shall allow business services and
  future capabilities to be unit-tested without a running browser or network.
- **NFR-004 (Security — Headers)** All backend responses shall include hardened
  security headers via Helmet.
- **NFR-005 (Security — CORS)** Cross-origin access shall be restricted to a
  configurable allow-list; wildcard origins are permitted only in local
  development.
- **NFR-006 (Security — Input)** All external input shall be schema-validated
  before use; invalid input shall be rejected with a sanitised error.
- **NFR-007 (Security — Secrets)** No secrets shall be committed or exposed to the
  browser; only `NEXT_PUBLIC_*` values may reach the client.
- **NFR-008 (Observability)** Logs shall be structured (JSON) and correlate to
  requests, enabling later tracing of both human and agent-originated calls.
- **NFR-009 (Performance)** The website shell shall achieve a fast first load
  (static/prerendered where possible) and the health endpoint shall respond in
  well under 100 ms locally.
- **NFR-010 (Accessibility)** The shell shall meet a WCAG 2.1 AA-oriented
  baseline for structure, contrast, and keyboard operability. (Full conformance
  requires later manual assistive-technology testing.)
- **NFR-011 (Responsiveness)** The UI shall be usable and legible from 320 px up
  to large desktop widths.
- **NFR-012 (Portability / Deployment)** The applications shall be deployable to
  Vercel with configuration supplied via environment variables.
- **NFR-013 (Reliability)** The backend shall start deterministically, fail fast
  on invalid configuration, and shut down gracefully on termination signals.
- **NFR-014 (Extensibility for Agents)** Adding a future capability or WebMCP tool
  shall not require modifying the business-service layer's public contract.
- **NFR-015 (Documentation)** Every major architectural decision shall be recorded
  so a stakeholder can understand the transformation without reading code.

## 9. Acceptance Criteria

Written in **Given / When / Then** form. Each maps to requirements above.

- **AC-01 (FR-001, FR-004)**
  *Given* the repository, *when* the structure is inspected, *then* `client`,
  `server`, and `docs` exist as siblings under `App/`, `.kiro/` exists at the
  workspace root, and no `client/server` nesting exists.

- **AC-02 (FR-002, FR-003, NFR-001, NFR-002)**
  *Given* the `App/` workspace root, *when* `npm run typecheck` and `npm run lint`
  are executed, *then* both workspaces pass with zero type errors and zero lint
  warnings.

- **AC-03 (FR-005, FR-006, FR-007)**
  *Given* the client, *when* it is built, *then* it builds successfully as a
  Next.js App Router app using TypeScript strict mode and Tailwind.

- **AC-04 (FR-008, FR-009, FR-010)**
  *Given* the running website, *when* a learner opens it and selects each
  navigation item, *then* a header/nav/footer shell renders and each of Home,
  Education, Admissions, Lifelong Learning, Industry, and About routes client-side
  to its placeholder page.

- **AC-05 (FR-012, FR-013, NFR-010, NFR-011)**
  *Given* the website shell, *when* viewed at 320 px and at desktop width with
  keyboard-only navigation, *then* layout remains usable, landmarks and focus
  states are present, and controls are labelled.

- **AC-06 (FR-015, FR-016)**
  *Given* the backend is running, *when* `GET /api/health` is requested, *then*
  it returns HTTP 200 with `status: "ok"`, service name, version, uptime, and a
  timestamp.

- **AC-07 (FR-017, FR-019, FR-020)**
  *Given* the backend, *when* an unknown route is requested or a handler throws,
  *then* the response is a structured, sanitised JSON error with an appropriate
  status code and no internal details leaked.

- **AC-08 (FR-018, AR-001, AR-002, AR-007)**
  *Given* the backend source, *when* the layering is inspected, *then* Routes,
  Controllers, Services, Repositories, and a synthetic-data location are present
  and separated, with business logic residing in Services.

- **AC-09 (FR-021, FR-022, FR-023, NFR-004, NFR-005, NFR-006, NFR-008)**
  *Given* the backend, *when* requests are made, *then* Helmet headers are
  present, CORS enforces the configured allow-list, invalid input is rejected via
  Zod, and structured logs are emitted without secrets/PII.

- **AC-10 (FR-024, FR-014, NFR-007)**
  *Given* the repository, *when* environment handling is inspected, *then*
  `.env.example` files exist for both workspaces, no real env files are committed,
  and only `NEXT_PUBLIC_*` values are exposed to the browser.

- **AC-11 (AR-003, AR-004, AR-005, AR-006)**
  *Given* the documented architecture, *when* reviewed, *then* it defines the
  READ/NAVIGATION/WRITE permission classification, a human-confirmation seam for
  future writes, a WebMCP integration boundary that does not require rewriting the
  business layer, and a capability design that is independently testable.

- **AC-12 (FR-025, NFR-015)**
  *Given* the documentation, *when* a stakeholder reads it, *then* the repository
  structure, setup steps, and the RP-to-Agent-Ready transformation model are
  clearly explained.

- **AC-13 (NFR-012, NFR-013)**
  *Given* invalid configuration, *when* the backend starts, *then* it fails fast
  with a clear message; and *given* a termination signal, *then* it shuts down
  gracefully.

## 10. Definition of Done

Specification 01 is done when **all** of the following hold:

1. Repository structure matches §4.1 and AC-01.
2. `npm run typecheck` and `npm run lint` pass for both workspaces (AC-02).
3. `npm run build` succeeds for both workspaces (AC-03).
4. The website shell renders with working navigation across all six sections
   (AC-04) and meets the responsive/accessibility baseline (AC-05).
5. `GET /api/health` returns the specified payload; 404 and error handling behave
   as specified (AC-06, AC-07).
6. Backend layering (Routes→Controllers→Services→Repositories→Data) is present
   and business logic lives in Services (AC-08).
7. Security, validation, and logging foundations are in place (AC-09).
8. Environment examples exist with no committed secrets (AC-10).
9. Agent-readiness architecture (permissions, human-confirmation seam, WebMCP
   boundary, testable capabilities, layer separation) is documented (AC-11).
10. Documentation foundation explains structure, setup, and the transformation
    model (AC-12).
11. Startup/shutdown behaviour is deterministic (AC-13).
12. No out-of-scope functionality (§4.2) has been implemented.

## 11. Out of Scope

As enumerated in §4.2: no course catalogue/search/filtering/details/comparison,
no enquiry or application workflow, no WebMCP or browser WebMCP integration, no AI
model/agent/demo, no authentication/authorization, no database, and no Republic
Polytechnic integration, scraping, API use, production forms, assets, or branding.
All data used anywhere in the prototype is synthetic.
