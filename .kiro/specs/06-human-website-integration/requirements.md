# Specification 06 — Human Website Integration & Completion · Requirements

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 06-human-website-integration
**Title:** Human Website Integration & Completion
**Status:** Draft for review (Phase 1 — human website; SPECIFICATION PHASE)
**Builds on:** `.kiro/specs/01-foundation/`, `02-course-catalogue/` (implemented),
and `03-course-details/`, `04-course-comparison/`, `05-course-enquiry/` (specified).
**Related steering:** `.kiro/steering/product.md`, `architecture.md`, `coding-standards.md`, `security.md`, `testing.md`
**Related docs:** `App/docs/phase-1-integration.md`

---

## 0. Phase note

Phase 1 (human website): Foundation (01), Catalogue (02), Details (03),
Comparison (04), Enquiry (05), **Integration & Completion (06)**, then Testing &
Quality (07). Phase 2 (Agent-Ready Transformation) is later and separate.

**This specification is strictly about integrating the human website.** It
introduces **no** AI-agent, WebMCP, MCP, tool-registry, permission, or AI-model
concepts, and **no** new business features. A short conceptual forward-looking
note appears in §17.

## 1. Purpose

Specifications 02–05 each deliver a self-contained human capability (catalogue,
details, comparison, enquiry) that is independently buildable and testable.
Specification 06 defines how those capabilities become **one coherent website**:
the cross-feature navigation and journeys, the shared contracts that hold the
features together, the global website shell (header/navigation/footer,
breadcrumbs, notifications), consistent global UI behaviour (buttons, forms,
cards, status, loading/empty/error), any **missing human-facing shell pieces**
needed for Phase 1 to feel complete, and the integration boundaries between
feature teams.

Spec 06 is **not another feature**. It is glue, consistency, completion, and the
end-to-end human journeys — using Specs 01–05 as the source of truth and **not**
inventing conflicting functionality.

## 2. Business Context

A learner should experience EduAgent Connect as a single, professional education
website, not a set of disconnected screens. They must be able to move smoothly
Catalogue ⇄ Details ⇄ Comparison ⇄ Enquiry, with a consistent shell, consistent
states, and a course identity that stays stable across every feature. Spec 06
guarantees that experience and closes any remaining human-shell gaps within
Phase 1 scope.

## 3. Relationship to RP Reference Experience

Republic Polytechnic remains a **functional reference only** for the overall
information architecture and journeys. EduAgent Connect uses an **original design
and synthetic data**; Spec 06 does not scrape RP, use RP data/APIs, or copy RP
assets, and adds no external/production integration.

## 4. Problem Statement

Today the shell has top-level navigation and a static footer only; there is no
Lifelong-Learning sub-navigation, no breadcrumbs, no shared comparison provider
mounted globally, no consistent cross-feature confirmation/notification behaviour,
and no single place that guarantees the features' navigation contracts line up
(e.g. the enquiry entry route that Details/Comparison link to, and the
comparison interface that Details optionally consumes). Without an integration
specification, feature teams risk inconsistent UI, drifting contracts, and broken
end-to-end journeys.

## 5. Scope

### 5.1 In Scope

- **Cross-feature integration and navigation** across Catalogue, Details,
  Comparison, and Enquiry, including the confirmation return path.
- **Shared contract governance:** consolidating and validating the contracts
  between Specs 02→03, 02→04, 03→05, 04→03, 04→05, and documenting any conflicts
  (without silently changing prior specs).
- **Global website shell completion:** consistent header, primary navigation,
  Lifelong-Learning sub-navigation (where appropriate), footer with useful links,
  breadcrumbs where appropriate, and a lightweight global notification mechanism.
- **Global UI consistency:** shared behaviour/patterns for buttons, forms, cards,
  status indicators, errors, loading, empty states, notifications, and page
  layouts, reusing Spec 01 primitives and Spec 02 conventions.
- **Cross-feature state integration:** mounting the Spec 04 comparison provider in
  the shell so comparison state is shared across features; wiring the Spec 03/04
  → Spec 05 enquiry navigation.
- **Missing human-shell pieces** required for Phase 1 completeness (route
  aliases/redirects if agreed, a Lifelong-Learning landing that surfaces the
  catalogue/compare, consistent page metadata/titles), strictly within Phase 1.
- **Cross-feature error, loading, empty, and not-found consistency**, including
  a global 404 and a consistent unavailable-course experience.
- **Responsive and accessibility consistency** across the integrated site.
- **Integration and end-to-end human-journey definitions** (the tests themselves
  are owned/expanded by Spec 07; Spec 06 defines the journeys and the seam-level
  integration checks).

### 5.2 Out of Scope (see §14 / §16)

New business features or new course/enquiry logic (owned by Specs 02–05); the
full formal quality/release-readiness gate and exhaustive cross-feature test
suite (Specification 07); any change to the shared Course model (Spec 02 owns it);
authentication, accounts, payments, database/persistence beyond what Spec 05
defines (synthetic in-memory), external/production/CRM integration; and **all**
AI-agent / WebMCP / MCP / agent-tool / AI-model functionality (Phase 2).

## 6. User Personas

| ID  | Persona | Need in Spec 06 |
| --- | ------- | --------------- |
| P1  | Prospective Learner (Human) | Move seamlessly across catalogue, details, comparison, and enquiry as one website. |
| P2  | Working Professional (Human) | Consistent navigation, states, and a stable course context throughout the journey. |
| P3  | Integration Lead / Developer | A single specification for cross-feature wiring, shell completion, and contract validation. |
| P4  | Feature Developers (Teams A–D) | Clear integration boundaries so features plug in without modifying each other. |
| P5  | Accessibility / QA Reviewer | Consistent, accessible, responsive behaviour across the whole site. |
| P6  | Solution Architect / Stakeholder | Evidence the human website is coherent and complete for Phase 1. |

## 7. Target Human Website (source of truth: Specs 01–05)

```
HOME
 ├─ Education
 ├─ Admissions
 ├─ Lifelong Learning
 │    ├─ Course Catalogue (Spec 02): Search · Filter · Sort · Pagination · Compare · View Details
 │    ├─ Course Details   (Spec 03): Course Information · Compare · Enquire
 │    ├─ Course Comparison(Spec 04): Compare Courses · View Details · Enquire
 │    └─ Course Enquiry   (Spec 05): Form · Validation · Submission · Confirmation
 ├─ Industry
 └─ About
```

## 8. Functional Requirements — Cross-Feature Integration & Navigation

EARS-style where appropriate.

### Cross-feature navigation paths
- **FR-601** The system shall support navigation **Catalogue → Details** (from a
  course card's "View Details").
- **FR-602** The system shall support **Catalogue → Comparison** (add-to-compare
  on cards + a way to open the comparison view).
- **FR-603** The system shall support **Details → Catalogue** (back to catalogue).
- **FR-604** The system shall support **Details → Comparison** (add-to-compare on
  the details page via the shared comparison interface, and a path to the
  comparison view).
- **FR-605** The system shall support **Details → Enquiry** (Enquire, carrying the
  course identity).
- **FR-606** The system shall support **Comparison → Catalogue** (return to
  catalogue).
- **FR-607** The system shall support **Comparison → Details** (open a course's
  details).
- **FR-608** The system shall support **Comparison → Enquiry** (Enquire about a
  chosen course, carrying its identity).
- **FR-609** The system shall support **Enquiry → Confirmation** (successful
  submission ends in a confirmation state).
- **FR-610** The system shall provide, from **Confirmation**, a clear path back to
  a relevant website location (e.g. the course details, the catalogue, or
  Lifelong Learning).

### Shared course contract & identifiers
- **FR-611** All features shall use the **Course contract established by
  Specification 02**; Spec 06 shall **not** define a new Course model.
- **FR-612** The **Course ID** shall remain consistent and stable across catalogue,
  details, comparison, and enquiry (the identity used in links, comparison entries,
  and enquiry association).
- **FR-613** The enquiry shall be associated with the **same Course ID** used to
  reach it from Details or Comparison.

### Global navigation & shell
- **FR-614** The system shall provide a consistent **header** and **primary
  navigation** on every page, with the active top-level section indicated.
- **FR-615** The system shall provide **Lifelong-Learning navigation** that lets a
  user reach the Course Catalogue (and the comparison view) from the
  Lifelong-Learning area.
- **FR-616** The system shall provide a consistent **footer** on every page,
  including the synthetic-data/demonstration notice and useful secondary links.
- **FR-617** The system shall provide **breadcrumbs where appropriate** (e.g.
  Lifelong Learning → Course Catalogue → [Course] → Enquire) to orient the user.
- **FR-618** Navigation shall be **client-side** (no full reload) and **back/forward
  behaviour** shall be predictable and consistent with the browser history.
- **FR-619** **Deep links** to any primary human route (catalogue with query state,
  a specific course's details, the comparison view, the enquiry entry) shall render
  the correct page directly.

### Global UI consistency
- **FR-620** The system shall apply **consistent UI patterns** across features for
  buttons, forms, cards, status indicators, errors, loading, empty states, and
  page layouts, reusing the Spec 01 primitives and Spec 02 conventions.
- **FR-621** The system shall provide a **consistent, lightweight notification
  mechanism** for cross-feature confirmations/feedback (e.g. enquiry submitted,
  comparison-limit reached) that is accessible and does not rely on colour alone.
- **FR-622** Page **titles/metadata** shall be consistent and descriptive across all
  primary human routes.

### Cross-feature state
- **FR-623** The **comparison state** (Spec 04's shared interface) shall be
  available across catalogue, details, and comparison within a session (e.g. the
  comparison provider mounted in the shell), so a course added anywhere is reflected
  everywhere.
- **FR-624** Cross-feature navigation shall **preserve relevant context** where
  useful (e.g. returning to the catalogue restores prior catalogue query state via
  its URL, and the comparison count remains accurate after navigating).

### Missing human-shell completion
- **FR-625** The system shall identify and complete any **remaining human-facing
  shell pieces** required for Phase 1 completeness — at minimum: a
  Lifelong-Learning landing that surfaces the catalogue/comparison, breadcrumbs on
  the course routes, footer quick links, and consistent page metadata — **without**
  expanding beyond Phase 1 scope.
- **FR-626** If a top-level route **alias/redirect** (e.g. `/courses/:courseId`) is
  agreed during integration, it shall be defined here as an integration decision;
  otherwise the established Spec 02/03 routes remain canonical.

### Cross-feature error, loading, empty & not-found handling
- **FR-627** The system shall provide a consistent **global 404 / not-found**
  experience for unknown routes, with a path back into the site.
- **FR-628** The system shall present a **consistent invalid/unavailable-course**
  experience wherever a course id is used (details, comparison, enquiry).
- **FR-629** The system shall present **consistent API-failure and network-error**
  states across features (user-friendly, retry where applicable, never exposing
  internals).
- **FR-630** The system shall present **consistent empty states** across features
  (e.g. no catalogue results, empty comparison) with clear guidance/next steps.
- **FR-631** The system shall present a **consistent failed-enquiry** experience
  that lets the user retry without losing entered data where reasonable.

## 9. Non-Functional Requirements

- **NFR-601 (Architecture integrity)** Integration shall preserve the layered
  architecture (Human UI → REST API → Services → Repositories → Synthetic Data);
  no business logic shall move into the shell or be duplicated
  (`.kiro/steering/architecture.md`).
- **NFR-602 (No shared-model drift)** The shared Course model/contract shall not be
  duplicated or forked; any needed change is a coordinated shared-contract change
  (see §10 / `App/docs/phase-1-integration.md`).
- **NFR-603 (Type safety)** All integration code shall compile under TypeScript
  strict mode with zero errors.
- **NFR-604 (Consistency)** The site shall reuse Spec 01 primitives and Spec 02
  conventions; original, professional education-platform design — not an RP clone.
- **NFR-605 (Accessibility, WCAG 2.1 AA-oriented)** Consistent site-wide semantic
  landmarks, one H1 per page, keyboard operability with visible focus, labelled
  controls, `aria-live` for status/notifications, correct breadcrumb semantics,
  AA contrast, and no meaning conveyed by colour alone. Full conformance requires
  later manual assistive-technology testing (finalised in Spec 07).
- **NFR-606 (Responsive)** The integrated site shall be usable and consistent at
  mobile (≈320–480 px), tablet (≈481–1024 px), and desktop (>1024 px), including a
  usable mobile navigation pattern.
- **NFR-607 (Performance)** Integration shall not regress the fast first-content
  behaviour established by Specs 01–05; client-side navigation shall be smooth.
- **NFR-608 (Security)** Reuse Spec 01 security (Helmet/CORS, sanitised errors,
  no secrets in the client); integration adds no new endpoints and no new
  security surface beyond what Spec 05 already defines.
- **NFR-609 (Determinism/Testability)** Integration seams shall be testable with
  substituted API clients/injected dependencies (no real network) so cross-feature
  behaviour is deterministic.
- **NFR-610 (Non-regression)** Integration shall not break Spec 01 (health, shell)
  or Spec 02 (catalogue) behaviour, nor the standalone behaviour of Specs 03–05.

## 10. Shared Contracts (consolidated & validated)

Spec 06 **documents and validates** the following contracts; it does **not**
redefine the Course model and does **not** silently modify prior specs. Any
conflict is recorded in §11.

| # | Contract | Input | Output | Owner | Consumed by | Integration point |
| - | -------- | ----- | ------ | ----- | ----------- | ----------------- |
| C1 | **Course model** | — | shared `Course` type + enums/labels | **Spec 02** | 03, 04, 05 | `client/src/lib/courses/types.ts`; server `domain/course.ts` |
| C2 | **Course ID** | — | stable slug-like `id` | **Spec 02** | 03, 04, 05 | routes, links, comparison entries, enquiry association |
| C3 | **Course list/detail API** | query / `:courseId` | `{data,pagination}` / `{data:Course}` (404 if unlisted) | **Spec 02** | 03, 04, 05 | `GET /api/courses`, `GET /api/courses/:courseId` via `coursesApi` |
| C4 | **Details route** | `courseId` | details page | **Spec 02/03** | 02, 04 | `/lifelong-learning/courses/:courseId` |
| C5 | **Comparison interface** | `add/remove/has/clear` | `items,count,isFull,max(=4)` | **Spec 04** | 03 (optional), 02 (card) | `useComparison()` / comparison context |
| C6 | **Comparison route** | comparison state | comparison view | **Spec 04** | 02, 03 | e.g. `/lifelong-learning/courses/compare` |
| C7 | **Enquiry entry route/params** | `courseId` | enquiry form | **Spec 05** | 03, 04 | e.g. `/lifelong-learning/courses/:courseId/enquire` |
| C8 | **Enquiry submission API** | enquiry payload | `201 {data:{reference,…}}` / envelope errors | **Spec 05** | (form) | `POST /api/enquiries` |
| C9 | **Spec 01 infra** | — | `validate`, `ApiError`, error handler, logger, config, Helmet/CORS, client boundary, UI primitives | **Spec 01** | 02–05 | server `http/*`, `config/*`; client `lib/*`, `components/ui/*` |

**Mapping to the requested dependencies:**
- Spec 02 → Spec 03: C1, C2, C3, C4.
- Spec 02 → Spec 04: C1, C2, C3, C6.
- Spec 03 → Spec 05: C2, C7 (Details' "Enquire" → enquiry entry).
- Spec 04 → Spec 03: C4, C5 (Comparison "View Details"; card add-to-compare uses C5).
- Spec 04 → Spec 05: C2, C7 (Comparison "Enquire" → enquiry entry).

## 11. Documented Contract Conflicts / Open Questions

Spec 06 records — but does not silently resolve — the following, for review and
approval before integration:

- **CQ-1 (Enquiry entry route shape).** Spec 05 owns the enquiry entry route and
  lists two candidate shapes (nested `/lifelong-learning/courses/:courseId/enquire`
  vs. query-based `/lifelong-learning/enquiry?courseId=…`). Spec 03/04 link to
  "the entry point" abstractly. **Resolution:** Integration must confirm one
  concrete shape (recommended: the nested route, see design) and all consumers link
  to it. Tracked by TASK-603.
- **CQ-2 (Comparison route path).** Spec 04's design gives the comparison route as
  an example (`/lifelong-learning/courses/compare`) with a note to avoid colliding
  with `[courseId]`. **Resolution:** Confirm the final path and ensure Next.js
  routing precedence (static `compare` segment vs. dynamic `[courseId]`) is correct.
  Tracked by TASK-602/TASK-605.
- **CQ-3 (Top-level `/courses/:courseId` alias).** The Spec 03 objective referenced
  a conceptual `/courses/:courseId`; the canonical route is
  `/lifelong-learning/courses/:courseId`. **Resolution:** Decide in integration
  whether to add an alias/redirect (FR-626); default is no alias. Tracked by
  TASK-609/TASK-610.
- **CQ-4 (Comparison provider mount point).** Spec 04 assumes a provider mounted
  "in the app shell". The shell is a Spec 01 asset. **Resolution:** Integration
  (this spec) owns mounting the provider without changing feature internals.
  Tracked by TASK-604.
- **CQ-5 (Global notifications).** Specs 04 (limit reached) and 05 (submitted) each
  describe local feedback; there is no shared notification mechanism yet.
  **Resolution:** Spec 06 defines a lightweight, accessible notification/status
  pattern (FR-621) that features may use consistently. Tracked by TASK-612.

> No prior specification is modified by this document. If a resolution requires a
> change to a prior spec (e.g. fixing the enquiry route in Spec 05), it is raised as
> an explicit shared-contract change and applied by that spec's owner during review.

## 12. Development Ownership

| Team | Owns | In Spec 06 context |
| ---- | ---- | ------------------ |
| **Team A** | Spec 02 — Catalogue | Provides card "View Details" + add-to-compare hook points |
| **Team B** | Spec 03 — Details | Provides details page + Enquire/compare affordances |
| **Team C** | Spec 04 — Comparison | Provides `useComparison`, add/remove control, comparison view/route |
| **Team D** | Spec 05 — Enquiry | Provides enquiry route/params, form, `POST /api/enquiries` |
| **Integration Lead** | **Spec 06** | Shell completion, provider mount, navigation/breadcrumbs, global states/notifications, contract validation, cross-feature wiring, end-to-end journeys |
| **QA/Quality Lead** | Spec 07 | Formal quality gates and exhaustive cross-feature/e2e/a11y/responsive validation |

**Integration-team vs feature-team work:** feature teams expose the seam points
their specs define; the **Integration Lead** wires them together in the shell,
completes global shell/UX pieces, validates contracts, and defines end-to-end
journeys. The Integration Lead must **not** change feature internals — only shell,
wiring, and shared-shell components — and must not modify the Course model.

## 13. Parallel Development & Sequencing

```
Shared contracts approved (C1–C9; CQ-1..CQ-5 resolved)
        ↓
Spec 03 · Spec 04 · Spec 05 implementation (parallel)
        ↓
Spec 06 integration (shell mount, navigation, wiring, global states)
        ↓
Spec 07 quality validation
```

- **Parallel:** Specs 03/04/05 implement independently once C1–C9 are agreed and
  CQ-1/CQ-2 (route shapes) are confirmed. Within Spec 06, shell-completion pieces
  (breadcrumbs, footer links, LL sub-nav, metadata, global 404, notification
  pattern) can be built in parallel with each other.
- **Sequential (true dependencies):** provider mount + cross-feature wiring
  (FR-623, and FR-601–FR-610) require the relevant feature seams to exist; final
  end-to-end journey validation requires all features integrated. Route-shape
  decisions (CQ-1/CQ-2/CQ-3) must be resolved before consumers wire to them.

## 14. Non-Goals (explicit)

- No new business features or new course/enquiry logic (owned by Specs 02–05).
- No change to the shared Course model (Spec 02 owns it).
- No authentication, accounts, payments, database beyond Spec 05's synthetic
  in-memory storage, or external/production/CRM integration.
- No exhaustive formal quality gate / full e2e suite (Specification 07).
- **No** WebMCP, MCP, AI agents, LLM, agent tools, agent registry, agent
  permissions/guardrails, AI recommendations, AI search, or AI-generated content
  (Phase 2).

## 15. Acceptance Criteria

Given / When / Then. Testable and observable.

- **AC-601 (Catalogue → Details) — FR-601**
  *Given* the catalogue, *when* the user activates "View Details" on a card, *then*
  the app navigates to that course's details page.
- **AC-602 (Catalogue → Comparison) — FR-602, FR-623**
  *Given* the catalogue, *when* the user adds a course to comparison and opens the
  comparison view, *then* the added course appears there.
- **AC-603 (Details → Catalogue) — FR-603**
  *Given* a details page, *when* the user activates "Back to catalogue", *then* the
  catalogue is shown.
- **AC-604 (Details → Comparison) — FR-604, FR-623**
  *Given* a details page with the comparison interface available, *when* the user
  adds the course to comparison, *then* the comparison count/state updates
  everywhere.
- **AC-605 (Details → Enquiry) — FR-605, FR-613**
  *Given* a details page, *when* the user activates "Enquire", *then* the enquiry
  form opens associated with the **same** course id.
- **AC-606 (Comparison → Details) — FR-607**
  *Given* the comparison view, *when* the user opens a course's details, *then* that
  course's details page is shown.
- **AC-607 (Comparison → Enquiry) — FR-608, FR-613**
  *Given* the comparison view, *when* the user chooses to enquire about a course,
  *then* the enquiry form opens associated with that course id.
- **AC-608 (Enquiry → Confirmation → return) — FR-609, FR-610**
  *Given* a valid enquiry, *when* it is submitted successfully, *then* a
  confirmation state is shown with a path back to a relevant website location.
- **AC-609 (Consistent Course ID) — FR-611, FR-612, FR-613**
  *Given* a course selected in the catalogue, *when* the user moves through details,
  comparison, and enquiry, *then* the same Course ID is used throughout.
- **AC-610 (Global navigation) — FR-614, FR-615, FR-616, FR-618**
  *Given* any major page, *when* the user uses the header/nav/footer, *then* primary
  navigation works from everywhere with the active section indicated, and footer is
  present.
- **AC-611 (Breadcrumbs & deep links) — FR-617, FR-619**
  *Given* a deep link to a course details / comparison / enquiry route, *when* it is
  opened directly, *then* the correct page renders with appropriate breadcrumbs.
- **AC-612 (Consistent errors) — FR-627, FR-628, FR-629, FR-631**
  *Given* an unknown route, an invalid course, an API failure, or a failed enquiry,
  *when* it occurs, *then* a consistent, user-friendly state is shown without
  exposing internals.
- **AC-613 (Consistent empty states) — FR-630**
  *Given* no catalogue results or an empty comparison, *when* the page renders,
  *then* a consistent empty state with guidance is shown.
- **AC-614 (Mobile navigation) — NFR-606, FR-618**
  *Given* a mobile viewport, *when* the user navigates the site, *then* navigation
  is usable (not a broken desktop layout).
- **AC-615 (Keyboard navigation) — NFR-605**
  *Given* keyboard-only operation, *when* the user traverses the site and its
  journeys, *then* all controls/links are reachable with visible focus and status
  changes are announced.
- **AC-616 (Non-regression) — NFR-610**
  *Given* the integrated site, *when* health/catalogue behaviours are exercised,
  *then* Spec 01/02 behaviours still pass and Specs 03–05 still work standalone.

## 16. Testing Requirements (integration-level; formal gate is Spec 07)

- **Integration/seam tests:** each cross-feature navigation (FR-601–FR-610) and
  the Course-ID continuity (FR-612, FR-613), using stubbed routers/faked API
  clients where appropriate; comparison-state sharing across features (FR-623).
- **Global-shell tests:** header/nav active state, footer presence, breadcrumbs on
  course routes, global 404, and the notification pattern.
- **Cross-feature state tests:** consistent error/empty/loading/not-found behaviour.
- **Responsive & accessibility integration checks:** mobile navigation, keyboard
  traversal, focus, and announcements across the journey.
- **Non-regression:** Spec 01 health/shell and Spec 02 catalogue behaviours.
- **Boundary:** end-to-end/full-journey and exhaustive a11y/responsive validation
  are **defined here but owned/expanded by Spec 07**; Spec 06 covers seam-level
  integration to avoid duplicating Spec 07's suite.

## 17. Future Agent Transformation Consideration (conceptual only)

> Forward-looking note only. Nothing here is designed or implemented in Spec 06.

After Phase 1 is complete, a separate Phase 2 effort will analyse the completed
human website and transform its existing capabilities into an Agent-Ready / WebMCP
architecture (capability discovery → agent tools → WebMCP layer → permissions/
human-confirmation → AI agent). **Spec 06 does not design or build any of that.**
