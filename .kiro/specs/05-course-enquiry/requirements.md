# Specification 05 — Human Course Enquiry · Requirements

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 05-course-enquiry
**Title:** Human Course Enquiry
**Status:** Draft for implementation (Phase 1 — human website)
**Builds on:** `.kiro/specs/01-foundation/` (implemented) and
`.kiro/specs/02-course-catalogue/` (implemented); reachable from Specifications 03
and 04.
**Related steering:** `.kiro/steering/product.md`, `architecture.md`, `coding-standards.md`, `security.md`, `testing.md`

---

## 0. Phase note

Phase 1 (human website): Foundation (01), Catalogue (02), Details (03),
Comparison (04), **Enquiry (05)**, then Completion/Integration (06) and Testing &
Quality (07). Phase 2 (Agent-Ready Transformation) is later and separate.

**This specification is a normal, human-facing enquiry form and submission
capability.** It introduces **no** AI-agent, WebMCP, MCP, tool-registry,
permission, or AI-model concepts, and **no** automated/agent enquiry submission. A
short conceptual forward-looking note appears in §16.

## 1. Purpose

Allow a human visitor to submit an enquiry about a course. The learner reaches an
enquiry form (primarily from Course Details), the selected course is associated
with the enquiry, the form is validated on the client for UX and **authoritatively
on the backend**, the enquiry is stored in a synthetic/in-memory repository, and a
confirmation with a synthetic reference number is shown.

This is the **first WRITE capability** in the human website. It adds a new backend
domain (Enquiry) following the exact layering established by Specification 01
(Routes → Controllers → Services → Repositories → Data), reusing the Spec 01 Zod
validation boundary, error handling, logging, and security middleware.

## 2. Business Context

On a realistic education website, a prospective learner submits an enquiry (name,
contact, message, course of interest) and receives a confirmation/reference.
This specification implements that everyday human flow end to end using **synthetic
local data** — no real institution system is contacted, no email is sent, no CRM
is integrated.

## 3. Relationship to RP Reference Experience

Republic Polytechnic is a **functional reference only** for the presence of an
enquiry/register-interest journey. EduAgent Connect uses an **original design and
synthetic data**; it does not scrape RP, use RP data/APIs, or copy RP assets, and
submits nothing to RP or any external system.

## 4. Problem Statement

The website can discover, view, and compare courses but has no way for a learner to
act by enquiring. There is no enquiry form, no enquiry domain model/validation, no
submission endpoint, no synthetic persistence, and no confirmation experience.

## 5. Scope

### 5.1 In Scope

- **Backend Enquiry capability** following Spec 01 layering:
  - Enquiry domain model + Zod schema (authoritative validation).
  - Enquiry repository over **synthetic/in-memory** storage (no database).
  - Enquiry service (business rules: validation orchestration, reference-number
    generation, course-existence check via the existing Course Service).
  - Enquiry controller + REST endpoint `POST /api/enquiries` (project conventions,
    shared response envelope).
- **Frontend enquiry experience:**
  - Enquiry entry point from Course Details (and optionally other appropriate human
    UI locations), carrying the selected course.
  - Enquiry form with appropriate fields, client-side validation, submission state,
    duplicate-submit protection, and error handling.
  - Confirmation state showing a synthetic reference number, the selected course,
    submission status, and next steps.
  - A visible note that this is a demonstration using synthetic data.
- Backend and frontend validation (backend is authoritative).
- Basic security protections reusing Spec 01 infrastructure.
- Backend unit/API tests, frontend component tests, and a client↔API integration
  test for the enquiry flow.

### 5.2 Out of Scope (see §7 / §15)

Real email delivery; CRM/marketing integration; payment; authentication; user
accounts; real education-institution/production-student systems; database/
persistence beyond synthetic in-memory storage; and **all** AI-agent / WebMCP /
MCP / agent-tool / AI-model functionality, including any automated or agent-driven
enquiry submission (Phase 2). This spec does not implement course details or
comparison internals (it links from them).

## 6. User Personas

| ID  | Persona | Need in Spec 05 |
| --- | ------- | --------------- |
| P1  | Prospective Learner (Human) | Ask about a course and receive a clear confirmation with a reference. |
| P2  | Working Professional (Human) | Submit a concise enquiry tied to a specific course. |
| P3  | Developer / Implementer (Team C) | A clean backend Enquiry capability + a form, reusing Spec 01 infrastructure and the Course capability. |
| P4  | Accessibility / QA Reviewer | A keyboard- and screen-reader-usable form with clear validation and status messaging. |
| P5  | Security / QA Reviewer | Authoritative backend validation, sanitised errors, no secrets/PII in logs. |

## 7. User Journey

```
Course Catalogue → Course Details → Enquire → Enquiry Form → Validate
        → Review/Submit → Confirmation (reference number + status + next steps)
```

## 8. Functional Requirements

EARS-style where appropriate.

### Entry point & course association
- **FR-501** The system shall allow a user to start an enquiry from **Course
  Details** (and optionally from other appropriate human UI locations, e.g. the
  comparison view), with the selected course associated with the enquiry.
- **FR-502** The enquiry shall carry the selected course's **id** (the shared
  Course identity from Specification 02); the form shall display the associated
  course (e.g. title) for confirmation.
- **FR-503** The system shall support enquiring when a course context is present;
  if the enquiry is opened without a valid course, the system shall handle it
  gracefully (see FR-517).

### Enquiry form & fields
- **FR-504** The enquiry form shall collect only justified fields: **name**,
  **email**, **phone** (optional), **enquiry type/category**, **message**, and the
  **associated course** (from context, not free-typed). No unnecessary personal
  information shall be collected.
- **FR-505** Enquiry type/category shall be a constrained set (e.g. `general`,
  `course_content`, `fees_funding`, `admissions`, `other`) defined once and reused
  by client and server.

### Client validation (UX)
- **FR-506** The form shall validate on the client before submission: required
  fields present (name, email, enquiry type, message), valid **email format**,
  valid **phone** when provided, and **message length** within defined bounds;
  invalid fields shall show accessible, field-level messages.
- **FR-507** Client validation is for UX only and shall **not** be relied upon for
  correctness or safety (see FR-508).

### Server validation (authoritative)
- **FR-508** The backend shall **independently validate every enquiry** with Zod at
  the request boundary, regardless of any client-side validation; invalid input
  shall be rejected with a structured **400** validation error and shall never reach
  storage.
- **FR-509** The backend shall enforce field constraints (required fields, email
  format, optional phone format, message min/max length, enquiry type within the
  allowed set, non-empty course id) and shall apply reasonable **maximum lengths**
  to all string fields to bound request size.
- **FR-510** The backend shall verify the referenced **course exists and is
  listable** using the existing Course Service (`getById`); an enquiry for an
  unknown/non-listable course shall be rejected with an appropriate structured
  error (see FR-517).

### Submission API & persistence
- **FR-511** The system shall expose `POST /api/enquiries` following project
  conventions, accepting the enquiry payload and returning the shared response
  envelope.
- **FR-512** On success the endpoint shall return **201** with a body containing the
  created enquiry's **reference number**, the associated course id (and title where
  available), the submission **status**, and a timestamp.
- **FR-513** The system shall persist enquiries in a **synthetic/in-memory
  repository** (the persistence approach established by the project); no production
  database shall be introduced.
- **FR-514** The system shall generate a **synthetic reference number** that is
  unique per submission and **deterministic enough for testing** (e.g. a prefixed,
  monotonic or seeded value, or an injectable id/clock so tests are deterministic).

### Confirmation
- **FR-515** After successful submission the UI shall show a **confirmation** state
  including: confirmation message, **reference number**, associated course,
  submission status, and appropriate **next steps**.
- **FR-516** The confirmation shall make clear that this is a **demonstration using
  synthetic data** and that no real institution has been contacted.

### Errors, duplicate submit & privacy
- **FR-517** The system shall handle and clearly communicate: client validation
  errors (inline), server validation errors (**400**), submission failures/network
  errors (user-friendly, retryable), and the **unavailable-course** case (e.g. the
  associated course no longer exists/is not listable → clear message, not a raw
  error).
- **FR-518** The UI shall provide reasonable **duplicate-submission protection**,
  such as disabling the submit control while a submission is in flight and
  preventing re-submission of an already-confirmed enquiry; it shall **not** be
  over-engineered into authentication or distributed idempotency.
- **FR-519** The UI shall communicate the synthetic/demonstration nature where
  appropriate and shall not collect unnecessary personal information (privacy by
  minimisation).

## 9. Security Requirements

Reusing Specification 01 infrastructure; **not** redesigning the security
architecture.

- **SR-501** All enquiry input shall be **server-side validated** with Zod at the
  boundary (the backend is the trust boundary); client validation is advisory only.
- **SR-502** Input shall be handled safely: bounded string lengths, constrained
  enums, and appropriate escaping/handling so stored/returned values cannot be used
  for injection or reflected attacks. (No SQL is used; no `dangerouslySetInnerHTML`
  for user content.)
- **SR-503** Error messages returned to clients shall be **generic and sanitised**
  (using the Spec 01 error envelope); internal details/stack traces shall never be
  exposed.
- **SR-504** Logs shall **not** contain secrets or PII: enquiry submissions shall be
  logged with the Spec 01 structured logger at the request level (method, path,
  status, duration) **without** logging personal fields (name, email, phone,
  message) or shall redact them.
- **SR-505** Requests shall have **reasonable constraints** (JSON body size limit /
  field maximums) to bound abuse; Helmet and the CORS allow-list from Spec 01 apply.
- **SR-506** No secrets shall exist in frontend code; the client holds no
  credentials and only calls the public API through the Spec 01 client boundary.

## 10. Non-Functional Requirements

- **NFR-501 (Layering)** Business logic shall live in the Enquiry **Service**;
  routes/controllers stay thin; the repository hides storage — matching Spec 01
  (`.kiro/steering/architecture.md`).
- **NFR-502 (Type safety)** All new code shall compile under TypeScript strict mode
  with zero errors; the server owns the authoritative enquiry Zod schema; the client
  uses derived/compatible types.
- **NFR-503 (Consistency)** Reuse the Spec 01 error envelope, `validate` middleware,
  `ApiError` taxonomy, logger, and config; reuse Spec 01 UI primitives and Spec 02
  styling. Original design, not an RP clone.
- **NFR-504 (Accessibility, WCAG 2.1 AA-oriented)** The form uses labelled
  controls, keyboard operability, visible focus, field-level error association
  (`aria-describedby`, `aria-invalid`), an `aria-live` region for submission
  status, and a correct heading hierarchy. Full conformance requires later manual
  testing.
- **NFR-505 (Responsive)** The form and confirmation shall be usable at
  mobile/tablet/desktop widths.
- **NFR-506 (Determinism)** Given the same input and an injected id/clock, the
  service shall produce a deterministic reference number and result (testability).
- **NFR-507 (Testability)** The Enquiry Service and repository shall be unit-testable
  without HTTP or a browser (substitutable repository, injectable id/clock); the API
  shall be testable via supertest; the form via Testing Library with a faked API
  client — per `.kiro/steering/testing.md`.
- **NFR-508 (Replaceable storage)** The repository interface shall allow the
  synthetic in-memory store to be replaced later (e.g. a database) without changing
  the Service contract.

## 11. Acceptance Criteria

Given / When / Then.

- **AC-501 (Entry with course) — FR-501, FR-502**
  *Given* a course details page, *when* the learner activates "Enquire", *then* the
  enquiry form opens with that course associated and displayed.

- **AC-502 (Client validation) — FR-506**
  *Given* the enquiry form, *when* the learner submits with a missing required field
  or an invalid email, *then* accessible field-level errors are shown and no request
  is sent.

- **AC-503 (Successful submission) — FR-508, FR-511, FR-512, FR-515**
  *Given* a valid enquiry, *when* the learner submits, *then* `POST /api/enquiries`
  returns 201 and the UI shows a confirmation with a reference number, the associated
  course, status, and next steps.

- **AC-504 (Server rejects invalid) — FR-508, FR-509, SR-501, SR-503**
  *Given* an invalid payload sent directly to the API (bypassing the client), *when*
  `POST /api/enquiries` is called, *then* it returns a structured 400 validation
  error and stores nothing.

- **AC-505 (Unknown course) — FR-510, FR-517**
  *Given* an enquiry referencing an unknown/non-listable course id, *when* submitted,
  *then* the API rejects it with an appropriate structured error and the UI shows a
  clear unavailable-course message (not a raw error).

- **AC-506 (Reference number) — FR-514, NFR-506**
  *Given* a successful submission with an injected id/clock in tests, *when* the
  enquiry is created, *then* a unique, deterministic reference number is returned.

- **AC-507 (Persistence) — FR-513**
  *Given* a successful submission, *when* the enquiry is created, *then* it is stored
  in the synthetic in-memory repository (observable via the service/repository in
  tests). No database is used.

- **AC-508 (Duplicate-submit protection) — FR-518**
  *Given* a submission in flight, *when* the learner clicks submit again, *then* the
  submit control is disabled and no second request is sent; an already-confirmed
  enquiry cannot be resubmitted from the confirmation state.

- **AC-509 (Error handling) — FR-517**
  *Given* a network/server failure, *when* submission fails, *then* a user-friendly,
  retryable error is shown without exposing internals.

- **AC-510 (No PII in logs) — SR-504**
  *Given* a submission, *when* it is logged, *then* logs contain request-level
  metadata only (no name/email/phone/message, or redacted).

- **AC-511 (Privacy notice) — FR-516, FR-519**
  *Given* the enquiry form/confirmation, *when* the learner views it, *then* a
  synthetic-data/demonstration notice is visible and only justified fields are
  requested.

- **AC-512 (Accessibility) — NFR-504**
  *Given* keyboard-only operation, *when* the learner completes and submits the form,
  *then* all controls are reachable with visible focus, errors are programmatically
  associated with fields, and submission status is announced.

## 12. Shared Contracts (consumed / produced)

**Consumed (from Spec 01/02/03 — do not redefine):**
- **Course model & Course ID** — the shared Course type/`id` (Spec 02). The enquiry
  references a course by `id`.
- **Course Service `getById` / `GET /api/courses/:courseId`** — used server-side to
  verify the course exists/is listable (FR-510).
- **Enquiry entry-point navigation contract** — the route/params by which Course
  Details (Spec 03) and the comparison view (Spec 04) navigate to the enquiry form
  carrying a course id. **Spec 05 owns and finalises this route/param contract**
  (e.g. `/lifelong-learning/courses/:courseId/enquire` or
  `/lifelong-learning/enquiry?courseId=…`); Spec 03/04 link to it.
- **Spec 01 infrastructure** — `validate` middleware, `ApiError`, error handler,
  logger, env/config, Helmet/CORS, client API boundary/transport, UI primitives.

**Produced (for other specs / integration):**
- **`POST /api/enquiries`** — the enquiry submission endpoint and its request/
  response contract.
- **Enquiry domain model + enquiry-type enum** — server-authoritative; client uses
  derived types.
- **Enquiry entry route/params** — the concrete navigation target Spec 03/04 use.

> **Course model change policy:** Specification 05 must **not** modify the shared
> Course model. Any genuine need must be raised as an explicit **shared contract
> change** coordinated with Spec 02's owner and dependents (see
> `App/docs/phase-1-integration.md`).

## 13. Development Ownership

- **Recommended owner:** Developer/Team **C** — Human Enquiry.
- Team C owns the Enquiry backend (domain, schema, repository, service, controller,
  route, tests) and the enquiry frontend (form, submission/confirmation states,
  tests), plus enquiry docs. Team C must **not** modify the Course model, catalogue
  internals, details internals, or comparison internals.
- Team C **finalises the enquiry entry route/param contract** and publishes it so
  Team A (Spec 03) and Team B (Spec 04) can link to it; this is coordinated early
  and confirmed in Spec 06.

## 14. Parallel Development

- Spec 05 can proceed **in parallel** with Spec 03 and Spec 04 once the shared
  Course model and `getById`/`GET /api/courses/:courseId` (already delivered by
  Spec 02) are agreed.
- **Sequential seam:** the **enquiry entry route/param contract** (§12) should be
  agreed early so Spec 03/04 can link to it. Until then, Spec 03/04 guard/point at
  the planned route; final wiring happens in integration (Spec 06).
- The backend Enquiry capability and the frontend form can be built largely in
  parallel within Team C once the request/response contract (§Design) is fixed.

## 15. Non-Goals (explicit)

- No real email/CRM/notification delivery; no payment; no auth; no accounts.
- No real institution/production-student systems; nothing submitted externally.
- No database/persistence beyond synthetic in-memory storage.
- No course details or comparison internals (only links from them).
- **No** WebMCP, MCP, AI agents, agent tools, tool registries, agent permissions,
  agent guardrails, or **automated/agent enquiry submission** (Phase 2).

## 16. Future Agent Transformation Consideration (conceptual only)

> Forward-looking note only. Nothing here is designed or implemented in Spec 05.

The completed human enquiry capability (prepare → validate → submit → status) could
later inform future `prepare_enquiry` / `validate_enquiry` / `submit_enquiry`-style
agent capabilities — where any agent-driven WRITE would require explicit human
confirmation under the Phase 1 architecture's documented safety model. **Spec 05
does not design or build any such tool, agent, or confirmation policy;** the future
phase determines actual tool boundaries after inspecting the completed application.
