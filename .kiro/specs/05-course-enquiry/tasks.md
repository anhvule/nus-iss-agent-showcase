# Specification 05 — Human Course Enquiry · Tasks

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 05-course-enquiry
**Owner:** Developer/Team C
**Traceability:** Each task references requirements in `./requirements.md` and design sections in `./design.md`.

Priority: **High** · **Medium** · **Low**. Tasks are independently executable and
verifiable. **No task implements WebMCP, agents, MCP, tools, or automated/agent
submission** (Phase 2). Backend follows Spec 01 layering; the frontend reuses
Spec 01/02 conventions.

---

## PHASE 0 — Review & Contract

### TASK-500
Priority: High · Dependency: Spec 01 + Spec 02 (implemented)
Description: Review Spec 01 `validate`/`ApiError`/error handler/async handler/
logger/config/security and how `courses` was wired into `app.ts`; review Spec 02
Course Service `getById`, Course type, and `coursesApi`. **Finalise and publish the
enquiry entry route/param contract** (§Design §10) so Spec 03/04 can link to it.
Completion: A short note confirming reused infra and the agreed enquiry entry
route/params. Satisfies FR-510, requirements §12, NFR-503.

---

## PHASE 1 — Backend Domain & Validation

### TASK-501
Priority: High · Dependency: TASK-500
Description: Define the Enquiry domain model and enquiry-type enum in
`server/src/domain/enquiry.ts` (server-authoritative), with derived types for the
client later.
Completion: `EnquiryInput`/`Enquiry` types and `ENQUIRY_TYPES` exist. Satisfies
FR-504, FR-505.

### TASK-502
Priority: High · Dependency: TASK-501
Description: Define the authoritative Zod schema and validation rules (required
fields; email format; optional phone; message length 10–2000; enum; non-empty
courseId; max lengths on all strings).
Completion: Valid input parses; invalid input is rejected; max lengths bound size.
Satisfies FR-508, FR-509, SR-502, SR-505.

---

## PHASE 2 — Backend Repository & Service

### TASK-503
Priority: High · Dependency: TASK-501
Description: Implement `EnquiryRepository` interface + `InMemoryEnquiryRepository`
(`create`, `findByReference`); constructor-injectable; no database/file I/O.
Completion: Enquiries can be stored and looked up by reference in memory. Satisfies
FR-513, NFR-508.

### TASK-504
Priority: High · Dependency: TASK-503
Description: Implement `EnquiryService.submit` (transport-agnostic): verify the
course via the existing Course Service `getById`; build the enquiry with an
**injected id generator + clock** producing a synthetic reference (e.g.
`ENQ-<year>-<seq>`); capture course title; persist; return `CreateEnquiryResult`.
Reject unknown/non-listable course with a typed error.
Completion: Valid submit persists and returns a deterministic reference; unknown
course → typed error. Satisfies FR-510, FR-512, FR-514, NFR-501, NFR-506.

---

## PHASE 3 — Backend API

### TASK-505
Priority: High · Dependency: TASK-502, TASK-504
Description: Implement the Enquiry controller (thin): validated body → `submit` →
**201** `{ data: CreateEnquiryResult }`; map the course-unavailable typed error to a
consistent structured status (per design §8) and unexpected → sanitised 500.
Completion: Controller translates HTTP ↔ service and shapes the envelope. Satisfies
FR-511, FR-512, FR-517, SR-503.

### TASK-506
Priority: High · Dependency: TASK-505
Description: Add `server/src/routes/enquiries.ts` (`POST /` with `validate('body',
enquiryInputSchema)` + async handler) and register `app.use('/api/enquiries', …)`
in `app.ts`; apply a reasonable JSON body-size constraint.
Completion: `POST /api/enquiries` is reachable and validated. Satisfies FR-511,
SR-505.

### TASK-507
Priority: High · Dependency: TASK-506
Description: Ensure backend validation is authoritative and errors are sanitised;
ensure request-level logging only (no PII: no name/email/phone/message logged, or
redacted).
Completion: Invalid payloads → structured 400; no PII appears in logs. Satisfies
FR-508, SR-501, SR-503, SR-504.

---

## PHASE 4 — Frontend Form & Flow

### TASK-508
Priority: High · Dependency: TASK-500
Description: Create the enquiry entry route (per the finalised contract, e.g.
`app/lifelong-learning/courses/[courseId]/enquire/page.tsx`) that reads the course
id, optionally loads the course via `coursesApi.getById` to show its title, and
hosts the form; handle an unavailable course gracefully.
Completion: The enquiry page opens with the associated course; unavailable course
handled. Satisfies FR-501, FR-502, FR-503.

### TASK-509
Priority: High · Dependency: TASK-500
Description: Implement the client `enquiriesApi.submit(input)` under
`client/src/lib/enquiries/` over the Spec 01 client boundary; derive client enquiry
types/labels from the server model; no business logic.
Completion: The client can POST an enquiry and receive the confirmation result or a
sanitised error. Satisfies FR-511, NFR-502.

### TASK-510
Priority: High · Dependency: TASK-508
Description: Implement `EnquiryForm` with labelled fields (name, email, phone,
enquiry type, message), the associated course shown read-only, and client-side
validation with accessible field-level errors.
Completion: The form renders and validates on the client. Satisfies FR-504, FR-506,
FR-507, NFR-504. Verifies AC-502.

### TASK-511
Priority: High · Dependency: TASK-509, TASK-510
Description: Implement the submission state (`idle | submitting | success | error`)
and wire submit to `enquiriesApi.submit`, carrying the associated course id.
Completion: Submitting a valid form calls the API and transitions state. Satisfies
FR-502, FR-511. Verifies AC-503.

### TASK-512
Priority: High · Dependency: TASK-511
Description: Implement `EnquiryConfirmation` showing reference number, associated
course, status, next steps, and a synthetic-data/demonstration notice.
Completion: A successful submission shows the confirmation with all elements.
Satisfies FR-515, FR-516, FR-519. Verifies AC-503, AC-511.

### TASK-513
Priority: High · Dependency: TASK-511
Description: Implement error handling: inline field errors, mapped 400 messages,
user-friendly retryable network/server errors, and the unavailable-course message.
Completion: Each error path is communicated clearly without exposing internals.
Satisfies FR-517, SR-503. Verifies AC-505, AC-509.

### TASK-514
Priority: High · Dependency: TASK-511
Description: Implement duplicate-submit protection: disable submit while
`submitting`; prevent resubmission from the confirmation state.
Completion: A second click during submission sends no second request; confirmed
enquiries cannot be resubmitted. Satisfies FR-518. Verifies AC-508.

---

## PHASE 5 — Accessibility & Security Validation

### TASK-515
Priority: High · Dependency: TASK-510, TASK-512, TASK-513
Description: Apply the accessibility baseline: labelled controls, `aria-invalid` +
`aria-describedby` error association, keyboard operability, visible focus, an
`aria-live` submission-status region, correct heading hierarchy; responsive layout
for form + confirmation.
Completion: Keyboard-only completion works; errors are associated; status announced;
usable across breakpoints. Satisfies NFR-504, NFR-505. Verifies AC-512.

### TASK-516
Priority: High · Dependency: TASK-507
Description: Security validation pass: confirm authoritative server validation,
sanitised errors, bounded field sizes/body limit, Helmet/CORS applied, no secrets in
the client, and no PII in logs.
Completion: Security requirements verified. Satisfies SR-501–SR-506. Verifies
AC-004-style checks AC-504, AC-510.

---

## PHASE 6 — Tests

### TASK-517
Priority: High · Dependency: TASK-502, TASK-503, TASK-504, TASK-232 (test tooling)
Description: Backend unit tests: schema validation (required/email/phone/length/
enum/max); repository `create`/`findByReference`; service submit (deterministic
reference via injected id/clock, persistence, course title capture, unknown-course
error).
Completion: Backend logic verified deterministically. Verifies FR-508–FR-514,
NFR-506.

### TASK-518
Priority: High · Dependency: TASK-506, TASK-517
Description: API tests (supertest): happy → 201 with reference/course/status;
invalid body → 400 with details; unknown course → mapped structured error; envelope
consistency; assert no PII is logged (logger spy).
Completion: API contract and logging privacy verified. Verifies AC-503, AC-504,
AC-505, AC-510, SR-503, SR-504.

### TASK-519
Priority: High · Dependency: TASK-510–TASK-514, TASK-232
Description: Frontend component tests (faked `enquiriesApi`/`coursesApi`): course
association; client validation errors; successful submit → confirmation; error
state; unavailable-course handling; duplicate-submit disabled; privacy notice;
accessibility (labels, error association, aria-live).
Completion: Form behaviour/states verified. Verifies AC-501, AC-502, AC-503,
AC-508, AC-509, AC-511, AC-512.

### TASK-520
Priority: Medium · Dependency: TASK-506, TASK-511
Description: Integration test: client form → real `POST /api/enquiries` (in-process
app) for happy-path and a validation rejection. (Cross-feature navigation
integration is deferred to Spec 06/07.)
Completion: The client↔API enquiry flow works end to end for success and rejection.
Verifies AC-503, AC-504.

---

## PHASE 7 — Documentation

### TASK-521
Priority: Medium · Dependency: TASK-506, TASK-512
Description: Document the Enquiry capability in `App/docs` (endpoint, request/
response, validation, reference format, synthetic storage, privacy/security notes,
run/test) and update `App/docs/phase-1-integration.md` with the produced contracts
(`POST /api/enquiries`, enquiry entry route/params). State WebMCP/agent is a future
phase.
Completion: Docs reflect the implemented capability and shared contracts. Satisfies
requirements §12, NFR-503.

---

## PHASE 8 — Validation

### TASK-522
Priority: High · Dependency: TASK-517, TASK-518, TASK-519, TASK-520
Description: Run `npm run typecheck`, `npm run lint`, server tests, client tests, and
the production build; resolve issues. Manually verify Details → Enquire → Form →
Validate → Submit → Confirmation, plus error/unavailable/duplicate paths across
breakpoints; confirm Spec 01/02 regression (health, catalogue) and that the Course
model was not changed.
Completion: Zero type/lint errors; all tests pass; build succeeds; journey and
error paths verified; no regressions. Satisfies NFR-502; validates AC-501–AC-512.

---

## Traceability — Requirements → Tasks

| Requirement | Task(s) |
| ----------- | ------- |
| FR-501 | TASK-508, TASK-519 |
| FR-502 | TASK-508, TASK-511 |
| FR-503 | TASK-508 |
| FR-504 | TASK-501, TASK-510 |
| FR-505 | TASK-501 |
| FR-506 | TASK-510 |
| FR-507 | TASK-510 |
| FR-508 | TASK-502, TASK-507, TASK-517 |
| FR-509 | TASK-502, TASK-517 |
| FR-510 | TASK-500, TASK-504, TASK-518 |
| FR-511 | TASK-505, TASK-506, TASK-509, TASK-511 |
| FR-512 | TASK-504, TASK-505, TASK-517 |
| FR-513 | TASK-503, TASK-517 |
| FR-514 | TASK-504, TASK-517 |
| FR-515 | TASK-512 |
| FR-516 | TASK-512 |
| FR-517 | TASK-505, TASK-513 |
| FR-518 | TASK-514 |
| FR-519 | TASK-512 |
| SR-501 | TASK-507, TASK-516 |
| SR-502 | TASK-502, TASK-516 |
| SR-503 | TASK-505, TASK-513, TASK-516, TASK-518 |
| SR-504 | TASK-507, TASK-516, TASK-518 |
| SR-505 | TASK-502, TASK-506, TASK-516 |
| SR-506 | TASK-509, TASK-516 |
| NFR-501 | TASK-504 |
| NFR-502 | TASK-509, TASK-522 |
| NFR-503 | TASK-500, TASK-521 |
| NFR-504 | TASK-510, TASK-515, TASK-519 |
| NFR-505 | TASK-515 |
| NFR-506 | TASK-504, TASK-517 |
| NFR-507 | TASK-517, TASK-518, TASK-519 |
| NFR-508 | TASK-503 |

---

## Scope guard (explicitly NOT in this specification)

No task implements or designs: WebMCP, MCP, agent tools/registry/permissions, agent
orchestration, AI-model integration, an AI agent, automated/agent enquiry
submission, real email/CRM/notification delivery, payment, authentication,
accounts, external/production systems, a database, or course details/comparison
internals.
