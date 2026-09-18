# Specification 01 — Foundation · Design

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 01-foundation
**Audience:** Senior engineers, solution architects, security reviewers
**Traceability:** Implements the requirements in `./requirements.md`; consistent with `.kiro/steering/*`.

---

## 1. Executive Summary

This document defines the architecture for the **foundation** of EduAgent
Connect — an original demonstration website that shows how a traditional,
human-oriented education website can be transformed into an **Agent-Ready**
platform. The foundation delivers a running Next.js frontend shell and an Express
backend API skeleton, wired with strict TypeScript, Tailwind, validation
(Zod), security middleware (Helmet, CORS), and structured logging (Pino).

Crucially, it establishes the **layered architecture and seams** that make the
later transformation possible: business capability lives in backend **Services**,
reachable through a stable **REST API**, so that both the **human UI** and a
future **Agent Capability Layer / WebMCP** consume the *same* business logic —
never a duplicate. No course, enquiry, WebMCP, or agent functionality is built
here; only the ground they will stand on.

The guiding test for every decision: *"Will this make it easier to expose this
website capability to an AI agent later?"*

## 2. Business and Technical Goals

**Business goals**

- Demonstrate a credible path from a conventional education website to one whose
  capabilities are safely reachable by AI agents.
- Let a stakeholder answer: *"How can we take an existing education website and
  make its existing capabilities available to AI agents in a structured, safe and
  controlled way?"*
- Do so with an original site (synthetic data), using Republic Polytechnic only
  as a functional reference for information architecture and journeys.

**Technical goals**

- A clean, layered, strictly-typed codebase with clear separation of concerns.
- One business layer serving two consumers (human UI and future agent layer).
- Safety primitives from day one: permission classification, human-confirmation
  seam, validation, sanitised errors, structured logs.
- Deployability to Vercel; configuration via environment variables only.

## 3. Architecture Principles

1. **One business layer, two consumers.** Human UI and future agents converge on
   the same Services. No business logic is duplicated in the UI or in WebMCP.
2. **Capability independence.** Business capabilities do not depend on rendering
   or on any agent runtime; they are invokable and testable in isolation.
3. **Explicit safety.** Operations are classified (READ / NAVIGATION / WRITE);
   sensitive writes require explicit human confirmation.
4. **Integration boundaries, not logic boundaries.** WebMCP and the browser are
   integration seams behind adapters; they must never accrete business logic.
5. **Validate at the edge, trust nothing.** All external input (human or agent)
   is validated with Zod at the boundary; the backend is the trust boundary.
6. **Foundation over features.** Build only the seams and skeleton now; defer
   features to later specs. Avoid complexity that does not serve agent-readiness.
7. **Observable and reproducible.** Structured logging, deterministic startup,
   fail-fast configuration.

## 4. Repository Architecture

Mandatory structure (siblings under `App/`; `.kiro/` at workspace root):

```
App/
├── client/          # Next.js + React + TS + Tailwind (human UI; future WebMCP adapter host)
├── server/          # Node.js + Express + TS (REST API + business services)
├── docs/            # Documentation
└── package.json      # npm workspaces root (orchestration scripts)
.kiro/
├── steering/         # Always-on project guidance
└── specs/
    └── 01-foundation/  # requirements.md · design.md · tasks.md
```

- **npm workspaces** manage `client` and `server` from one root, giving unified
  `dev`, `build`, `typecheck`, and `lint` scripts.
- `client` and `server` are **siblings**. A nested `client/server` is explicitly
  prohibited (FR-004).

**Rationale (agent-readiness):** a clean split between UI (`client`) and business
API (`server`) is the precondition for letting an agent reach business
capabilities without going through the UI.

## 5. Frontend Architecture

- **Framework:** Next.js **App Router** under `client/src/app`, React strict mode.
- **Styling:** Tailwind CSS via a shared theme; utility-first with a small set of
  primitives.
- **Layout composition:**
  - `Header` — brand + primary navigation region (landmark `header`).
  - `Navigation` — top-level links (Home, Education, Admissions, Lifelong
    Learning, Industry, About); keyboard operable, current-page aware.
  - `PageContainer` — consistent max-width, padding, and `main` landmark.
  - `Footer` — secondary links and legal/synthetic-data notice (landmark
    `footer`).
- **UI primitives (for reuse by later specs):** typography scale, `Button`,
  `Card`, `Container`. These are presentation-only; they contain no business
  logic.
- **Routing:** each navigation section is a placeholder route under the App
  Router. Client-side navigation, no full reload (FR-010).
- **Configuration:** backend base URL from `NEXT_PUBLIC_API_BASE_URL`; the client
  holds **no secrets** (FR-014, NFR-007).
- **Accessibility & responsiveness baseline:** semantic landmarks, visible focus,
  labelled controls, adequate contrast, and fluid layout from 320 px upward
  (FR-012, FR-013, NFR-010, NFR-011).

**Design intent:** the frontend is an independent, modern education platform — it
is **not** a visual clone of RP. RP informs *what* sections exist, not *how* they
look.

**Agent-readiness note:** the client will later host the **WebMCP browser
adapter**. The foundation keeps the client free of business logic so that, when
the adapter arrives, it forwards to the same API the UI uses — nothing to
untangle.

## 6. Backend Architecture

Layered pipeline (present as structure now, filled by later specs):

```
HTTP Request
   ↓
Routes          # HTTP surface: path + method → controller
   ↓
Controllers     # translate HTTP ↔ domain calls; validate input (Zod); shape responses
   ↓
Services        # BUSINESS LOGIC lives here (the reusable capability)
   ↓
Repositories    # data access abstraction (hides the source)
   ↓
Synthetic Data  # JSON fixtures (no database)
```

Cross-cutting: **config** (Zod-validated env), **logging** (Pino), **error
handling** (centralised), **security middleware** (Helmet, CORS).

- **Routes** contain no logic; they wire endpoints. Foundation ships `GET
  /api/health` only.
- **Controllers** own request/response translation and boundary validation, then
  delegate to Services.
- **Services** are the **single home of business logic** — the reusable
  capabilities that both the human UI (via API) and future agent tools (via the
  Agent Capability Layer → API) will call.
- **Repositories** abstract data access so the eventual swap from JSON fixtures to
  another source does not ripple into Services.

**Why this matters for WebMCP (AR-002, AR-005):** because business logic is
isolated in Services behind a stable API, a future WebMCP tool can invoke the
same capability the UI uses. The tool becomes a thin, permissioned adapter — not
a second implementation. This is the mechanism that guarantees "no duplicated
business logic."

## 7. API Architecture

- **Style:** REST over JSON, all endpoints under a versioned base path `/api`.
- **Response envelope:** consistent JSON shape for success and error; timestamps
  in ISO 8601.
- **Health endpoint (foundation deliverable):** `GET /api/health` →
  `{ status, service, version, uptimeSeconds, timestamp }` (FR-016, AC-06).
- **Not found:** unknown routes → structured `404` (FR-019).
- **Validation boundary:** request body/query/params validated with Zod in
  Controllers before any Service call (FR-021).
- **Versioning intent:** the `/api` base gives room to introduce `/api/v1`
  resources in later specs without breaking existing consumers (human or agent).

## 8. Configuration Architecture

- All process configuration flows through a **Zod-validated schema** loaded at
  startup (`server/src/config/env.ts`); invalid config **fails fast** (NFR-013).
- Recognised settings (foundation): `NODE_ENV`, `PORT`, `CORS_ORIGIN`; frontend:
  `NEXT_PUBLIC_API_BASE_URL`.
- `.env.example` committed for both workspaces; real env files are git-ignored
  (FR-024, NFR-007).
- No secrets are required by the foundation. Any future secret is an environment
  variable, documented by key name only.

## 9. Error Handling

- **Centralised handler** in the Express composition root catches thrown and
  rejected errors and returns a **sanitised** payload: a generic message and appropriate
  status code, never stack traces or internal identifiers (FR-020, AC-07).
- **Operational vs programmer errors:** the design anticipates a typed error
  taxonomy (e.g. validation error → 400, not found → 404, unexpected → 500) that
  later specs extend. The foundation ships the 404 and 500 paths.
- **Consistency:** error payloads share the API envelope so both human UI and
  future agent callers can parse failures uniformly.

## 10. Logging and Observability

- **Structured logging via Pino:** JSON logs for startup and per-request
  lifecycle (method, path, status, duration), with **no secrets or PII**
  (FR-023, NFR-008).
- **Correlation-ready:** the request-logging design leaves room to attach a
  correlation/request id so that, in later specs, a call can be traced whether it
  originated from the human UI or an agent tool. This makes agent actions
  **auditable** — a key safety property.
- **Levels:** environment-driven log level; verbose in development, lean in
  production.

## 11. Security Baseline

- **Helmet** sets hardened HTTP response headers on all responses (NFR-004).
- **CORS** restricts origins to a configurable allow-list; wildcard only for
  local development (NFR-005, FR-022).
- **Zod validation** at the boundary rejects malformed input with sanitised
  errors (NFR-006).
- **No frontend secrets;** only `NEXT_PUBLIC_*` reaches the browser (NFR-007).
- **Sanitised errors** and **structured logs** (no secrets/PII) as above.
- **Backend is the trust boundary:** all input — human or agent — is untrusted
  until validated server-side.
- **Future agent permission model (documented seam):** every future capability
  will declare a permission classification (READ / NAVIGATION / WRITE) and a
  confirmation requirement; sensitive WRITE actions require explicit human
  confirmation (AR-003, AR-004). Consistent with `.kiro/steering/security.md`.

## 12. Testing Architecture

- **Layered testability:** Services are pure-ish business logic testable without
  HTTP; Controllers testable with request/response doubles; the API testable via
  an in-process HTTP client (e.g. supertest) in later specs.
- **Substitutable boundaries:** Repositories and the future capability transport
  are interfaces, so tests inject fakes — no network, no browser (NFR-003,
  AR-006).
- **Foundation stance:** per `.kiro/steering/testing.md`, no test suite is added
  in this spec unless requested; the *architecture* guarantees future tests are
  cheap to write.
- **Verification gates (every task):** `typecheck`, `lint`, successful build, and
  health-endpoint check.

## 13. Agent-Readiness Architecture

The conceptual architecture the whole project is organised around:

```
                    Learner
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
       Human Website         AI Agent
             │                   │
             │                   ▼
             │          Agent Capability
             │                Layer
             │                   │
             └─────────┬─────────┘
                       ▼
                  REST API
                       │
                       ▼
                Business Services
                       │
                       ▼
                  Repository
                       │
                       ▼
                Synthetic Data
```

Two entry paths, one business core:

**Human path**

```
Human UI
   ↓
Application Capability (via REST API)
   ↓
Business Service
```

**Future agent path**

```
AI Agent
   ↓
WebMCP Tool
   ↓
Application Capability
   ↓
Business Service
```

Both paths terminate in the **same Business Service**. The Agent Capability Layer
is a *thin, permissioned* mediator that maps a tool invocation onto an existing
application capability; it adds classification, validation, and
human-confirmation policy — **not** business rules.

**Foundation obligations satisfied here (documentation + seams only):**

- **AR-001 / AR-002:** business logic isolated in Services, reachable by both
  consumers; no duplication.
- **AR-003:** the fixed permission vocabulary **READ / NAVIGATION / WRITE** is
  defined for future capabilities to adopt.
- **AR-004:** a **human-confirmation seam** is specified for future WRITEs.
- **AR-005:** WebMCP is an **integration boundary** that wraps existing
  capabilities, so it can be added without rewriting Services.
- **AR-006:** capabilities are designed to be invoked without a browser
  (substitutable transport), hence independently testable.
- **AR-007:** the layer separation UI → Agent Capability Layer → API → Services →
  Repository → Data is explicit, with browser/WebMCP specifics behind an adapter.

> Note on current repository state: the foundation already includes a
> **client-side typed capability abstraction/registry** under
> `client/src/lib/webmcp/` (see `.kiro/steering/architecture.md`) that encodes the
> READ/NAVIGATION/WRITE classification, the human-confirmation pipeline, and a
> transport adapter. In this and later specs, that registry is the **client-side
> expression** of the Agent Capability Layer; it dispatches to the backend
> Services via the transport and holds **no business logic**. Later specs may also
> introduce a server-side capability catalogue; either way, Services remain the
> single source of business truth.

## 14. Future WebMCP Architecture

Documented now, **not implemented** in Spec 01.

```
AI Agent
   ↓
WebMCP Adapter          # browser/runtime-specific integration (kept behind an adapter)
   ↓
Tool Registry           # discovery + metadata for available tools
   ↓
Agent Capability        # permissioned, validated mapping to an application capability
   ↓
Application Service     # the reusable capability (REST API surface)
   ↓
Business Logic          # Services — single source of truth
```

**Anticipated future tools** (defined in later specs, not here):
`find_courses`, `get_course_details`, `compare_courses`, `navigate_to_course`,
`navigate_to_enquiry`, `prepare_enquiry`, `validate_enquiry`, `submit_enquiry`,
`get_submission_status`.

**Each future tool will conceptually declare:**

| Field | Purpose |
| ----- | ------- |
| `name` | Stable identifier, e.g. `find_courses`. |
| `description` | Human/agent-readable intent. |
| `inputSchema` | Zod schema validating input. |
| `outputSchema` | Zod schema validating output. |
| `permission` | READ / NAVIGATION / WRITE. |
| `confirmationRequirement` | Whether explicit human confirmation is required. |
| `executionHandler` | Delegates to an application capability → Service. |

**Constraints (must hold for all future WebMCP work):**

- WebMCP is an **integration/capability boundary**, never the business-logic
  layer.
- **Browser-specific** WebMCP behaviour stays behind an **adapter**, treating
  WebMCP as an *emerging* browser capability so the app is not coupled to one
  browser/runtime implementation.
- WRITE tools (e.g. `submit_enquiry`) **must** require explicit human confirmation
  before execution.

## 15. RP-to-Agent-Ready Transformation Model

This is the central architectural theme.

**Current human experience (reference model)**

```
User
 ↓
Lifelong Learning
 ↓
Courses
 ↓
Search / Filter
 ↓
Course Details
 ↓
Apply / Register Interest
 ↓
Form
 ↓
Submit
```

**Future agent experience (target model)**

```
User
 ↓
AI Agent
 ↓
find_courses
 ↓
get_course_details
 ↓
compare_courses
 ↓
prepare_enquiry
 ↓
validate_enquiry
 ↓
Human Confirmation
 ↓
submit_enquiry
```

**The transformation in one sentence:** each human UI step is backed by an
**application capability** implemented in a **Business Service**; making the site
agent-ready means **exposing those same capabilities as permissioned WebMCP
tools** — not rebuilding them. The human "Submit" and the agent `submit_enquiry`
call the identical Service, and both require explicit human confirmation for the
write.

Specification 01 makes this possible by isolating business logic in Services
behind a stable API today, so the later "expose as tools" step is additive.

## 16. Future Specification Dependencies

```
01 Foundation
      ↓
02 Course Catalogue
      ↓
03 Course Details
      ↓
04 Enquiry Workflow
      ↓
05 WebMCP Capability Layer
      ↓
06 AI Agent Demo
      ↓
07 Security Hardening
      ↓
08 Deployment
```

- **02 Course Catalogue** builds on the backend layering (Routes→Controllers→
  Services→Repositories) and synthetic-data location, and the frontend primitives.
- **03 Course Details** extends catalogue Services and reuses UI primitives.
- **04 Enquiry Workflow** introduces the first WRITE + the human-confirmation seam
  established here.
- **05 WebMCP Capability Layer** wraps existing capabilities as tools using the
  permission model and adapter boundary defined here.
- **06 AI Agent Demo** consumes those tools via natural language.
- **07 Security Hardening** deepens the security baseline established here.
- **08 Deployment** operationalises the Vercel target configured here.

## 17. Architecture Decisions and Rationale

| ID | Decision | Rationale | Agent-readiness payoff |
| -- | -------- | --------- | ---------------------- |
| AD-01 | npm workspaces monorepo with sibling `client`/`server` | Single toolchain; clean UI/API split | Agents reach the API without touching the UI |
| AD-02 | Next.js App Router + Tailwind, original design | Modern, accessible, responsive shell; not an RP clone | UI can later host the WebMCP browser adapter cleanly |
| AD-03 | Express layered as Routes→Controllers→Services→Repositories | Business logic isolated in Services | Same Service serves human UI and future agent tools (no duplication) |
| AD-04 | Repositories over synthetic JSON (no DB) | Keeps scope tight; abstracts data source | Data source can change later without touching capabilities |
| AD-05 | Zod validation at the boundary + validated env | Trust nothing external; fail fast | Agent input is validated exactly like human input |
| AD-06 | Helmet + CORS allow-list | Baseline hardening | Controlled surface for agent-originated cross-origin calls |
| AD-07 | Pino structured logging, correlation-ready | Observability | Agent actions become auditable/traceable |
| AD-08 | Fixed permission vocabulary READ/NAVIGATION/WRITE | Explicit operation semantics | Agents cannot mutate while appearing to read |
| AD-09 | Human-confirmation seam for WRITE | Human-in-the-loop safety | Sensitive agent writes require explicit approval |
| AD-10 | WebMCP as adapter-bounded integration layer | Decouple from emerging browser API; no logic leakage | Add WebMCP later without rewriting Services |
| AD-11 | TypeScript strict everywhere | Type safety, maintainability | Stable contracts for tool schemas later |
| AD-12 | Vercel as deployment target | Simple hosting for demo | Reproducible environment for the agent demo |

---

**Consistency check:** every Functional and Agent-Readiness requirement in
`requirements.md` maps to a section here (FR-001–004 → §4; FR-005–014 → §5;
FR-015–020 → §6/§7; FR-021–024 → §8/§9/§10/§11; FR-025 → §1/§16; AR-001–007 →
§13/§14; NFRs → §9–§12, §17), and each is realised by a task in `tasks.md`.
