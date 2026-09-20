# Specification 05 — Human Course Enquiry · Design

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 05-course-enquiry
**Audience:** Senior engineers, solution architects, security & accessibility/QA reviewers
**Traceability:** Implements `./requirements.md`; extends `.kiro/specs/01-foundation/design.md` and `.kiro/specs/02-course-catalogue/design.md`; consistent with `.kiro/steering/*`.

---

## 1. Executive Summary

This design adds the human website's **first WRITE capability**: submitting a
course enquiry. It follows the Specification 01 layering exactly —
**Human UI → REST API → Enquiry Controller → Enquiry Service → Enquiry Repository →
Synthetic Storage** — and reuses the Spec 01 Zod validation boundary, error
envelope, logger, and security middleware. The Enquiry Service is transport-agnostic
(no Express, no React), so business logic is testable in isolation and kept out of
controllers and components. The frontend provides an accessible enquiry form,
submission/confirmation states, and duplicate-submit protection.

This is a **Phase 1 (human website)** specification. It contains **no** AI-agent or
WebMCP design and **no** automated/agent submission (see §13 for a conceptual
forward-looking note only).

## 2. Architectural Goals

1. **Backend is the trust boundary** — every enquiry independently validated with
   Zod, regardless of client validation (SR-501, FR-508).
2. **Clean layering** — logic in the Enquiry Service; thin controller/routes;
   storage behind a repository interface (NFR-501, NFR-508).
3. **Reuse, don't rebuild** — Spec 01 infrastructure and the Spec 02 Course Service
   for course verification (FR-510, NFR-503).
4. **Synthetic, safe, private** — in-memory storage, sanitised errors, no PII in
   logs, minimal fields (FR-513, SR-503, SR-504, FR-519).
5. **Deterministic & testable** — injectable id/clock for reference numbers
   (FR-514, NFR-506, NFR-507).

## 3. Data Flow

```
Human UI (Enquiry form)
   ↓  POST /api/enquiries (JSON)
REST API (Spec 01 /api composition)
   ↓
Enquiry Controller     # parse + Zod-validate (validate middleware) → shape envelope
   ↓
Enquiry Service        # business rules: verify course (Course Service), build enquiry,
   ↓                   #   generate reference, persist, return result
Enquiry Repository     # data access over synthetic storage (interface)
   ↓
Synthetic Storage      # in-memory array (no database)
```

## 4. Enquiry Domain Model (FR-504, FR-505, FR-509; server-authoritative)

New server module `server/src/domain/enquiry.ts` (mirrors the Course domain
pattern). Conceptual shape:

```ts
const ENQUIRY_TYPES = ['general', 'course_content', 'fees_funding',
                       'admissions', 'other'] as const;
type EnquiryType = (typeof ENQUIRY_TYPES)[number];

// Input the client submits (validated authoritatively on the server):
interface EnquiryInput {
  name: string;          // 1..100, trimmed
  email: string;         // valid email, <=254
  phone?: string;        // optional; if present, permissive intl format, <=32
  courseId: string;      // shared Course id, non-empty
  enquiryType: EnquiryType;
  message: string;       // 10..2000
}

// Stored/returned record:
interface Enquiry extends EnquiryInput {
  id: string;            // internal id
  reference: string;     // synthetic reference number, e.g. "ENQ-2026-000123"
  status: 'received';    // MVP submission status
  courseTitle?: string;  // captured at submit for confirmation/display
  createdAt: string;     // ISO timestamp
}
```

**Validation rules (Zod, FR-509, SR-502, SR-505):** required fields; email format;
optional phone pattern; message length 10–2000; `enquiryType` within the enum;
`courseId` non-empty; **maximum lengths on all strings** to bound request size.
Enquiry-type enum is defined once on the server; the client derives a compatible
type/label map.

## 5. Validation Design

- **Client (UX only, FR-506, FR-507):** a mirror of the constraints for immediate
  field-level feedback (required, email format, phone when present, message
  length). Never authoritative.
- **Server (authoritative, FR-508, FR-509, SR-501):** the controller uses the
  Spec 01 `validate('body', enquiryInputSchema)` middleware; invalid → structured
  **400** with field issues via the existing `ApiError.validation`. The client's
  claims are ignored — the server re-validates everything.

## 6. Repository Design (FR-513, NFR-508)

`server/src/repositories/enquiry-repository.ts`:

```ts
interface EnquiryRepository {
  create(enquiry: Enquiry): Promise<Enquiry>;
  findByReference(reference: string): Promise<Enquiry | null>; // supports tests/status
}
```

- In-memory implementation (`InMemoryEnquiryRepository`) backed by a module-level
  array; constructor-injectable for tests. No database, no file I/O.
- Interface allows a future DB-backed implementation without changing the Service
  (NFR-508). (A `findByReference` is included to make persistence observable in
  tests and to enable a future status lookup; no status endpoint is required by
  this spec.)

## 7. Service Design (FR-510, FR-512, FR-514; transport-agnostic)

`server/src/services/enquiry-service.ts`:

```ts
interface CreateEnquiryResult {
  reference: string;
  courseId: string;
  courseTitle?: string;
  status: 'received';
  createdAt: string;
}
interface EnquiryService {
  submit(input: EnquiryInput): Promise<CreateEnquiryResult>;
}
```

Pipeline inside `submit`:
1. **Verify course** via the existing Course Service `getById(input.courseId)`
   (reuse, no duplication). If null → a typed "course unavailable" error mapped by
   the controller to an appropriate status (see §8) (FR-510, FR-517).
2. **Build the enquiry**: generate `id` and a **reference number** using an
   **injected id generator + clock** (default: a monotonic/seeded synthetic
   generator producing e.g. `ENQ-<year>-<zero-padded-seq>`), capture `courseTitle`
   from the verified course, set `status = 'received'`, `createdAt = clock.now()`
   (FR-514, NFR-506).
3. **Persist** via the repository (FR-513).
4. **Return** `CreateEnquiryResult` (FR-512).

Dependencies (repository, Course Service, id generator, clock) are injected with
sensible defaults so the service is deterministic and unit-testable (NFR-507).

## 8. Controller & Routes (FR-511, FR-512, SR-503)

- `server/src/controllers/enquiry-controller.ts` — thin: validated body → call
  `enquiryService.submit` → **201** with `{ data: CreateEnquiryResult }`.
- Error mapping via the Spec 01 centralised handler and `ApiError`:
  - validation → **400 `VALIDATION_ERROR`** (via `validate` middleware);
  - unknown/non-listable course → an operational error rendered as a structured
    response (recommended **422** `VALIDATION_ERROR`-style *or* **404** depending on
    project convention; the controller maps the service's typed error consistently
    and sanitises the message);
  - unexpected → **500 `INTERNAL`** (sanitised).
- `server/src/routes/enquiries.ts` — `POST /` wired with `validate('body', …)` and
  the async handler, registered as `app.use('/api/enquiries', enquiriesRouter)` in
  `app.ts` (mirrors how `courses` was added).
- **Request constraints (SR-505):** an appropriate JSON body-size limit is applied
  (either the existing `express.json()` limit or a scoped limit) plus the schema's
  max lengths.

## 9. API Design (envelope reuse; FR-511, FR-512)

**`POST /api/enquiries`**

Request body (JSON): `{ name, email, phone?, courseId, enquiryType, message }`.

**Success — 201:**
```jsonc
{ "data": { "reference": "ENQ-2026-000123", "courseId": "cyber-essentials-pt",
            "courseTitle": "Cybersecurity Essentials for Working Professionals",
            "status": "received", "createdAt": "2026-05-01T09:00:00.000Z" } }
```

**Errors (Spec 01 envelope):**
```jsonc
{ "error": { "code": "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL",
             "message": "sanitised", "details"?: [ /* field issues */ ] } }
```
- 400 invalid body; course-unavailable mapped consistently (see §8); 500 unexpected.

## 10. Frontend Architecture (FR-501–FR-503, FR-515–FR-519, NFR-504, NFR-505)

- **Enquiry entry route (owned here):** a route that carries the course id, e.g.
  `client/src/app/lifelong-learning/courses/[courseId]/enquire/page.tsx`
  (a nested route under details keeps the course context explicit) **or** a
  top-level `/lifelong-learning/enquiry?courseId=…`. **This spec finalises the
  concrete route/param contract** and publishes it so Spec 03/04 link to it. The
  page reads the course id and (optionally) verifies/loads the course via
  `coursesApi.getById` to display its title and handle an unavailable course.
- **Client enquiry API:** a small `enquiriesApi.submit(input)` under
  `client/src/lib/enquiries/` built on the Spec 01 client boundary/transport;
  serialises the body, posts to `/api/enquiries`, returns the confirmation result
  or throws a sanitised error. Contains **no** business logic.
- **Components** under `client/src/components/enquiry/`:
  - `EnquiryForm` — labelled fields (name, email, phone, enquiry type, message),
    the associated course shown read-only, client validation with accessible
    field-level errors, and a submit control.
  - Submission state (discriminated union `idle | submitting | success | error`),
    reusing the Spec 01/02 pattern.
  - `EnquiryConfirmation` — reference number, associated course, status, next
    steps, and the synthetic-data notice.
  - A synthetic-data/demonstration notice component or inline message.
- **Client types:** derived from/compatible with the server enquiry model
  (enquiry-type enum + labels), server remains authoritative (NFR-502).

## 11. Errors, Duplicate-Submit & Privacy (FR-517, FR-518, FR-519, SR-*)

- **Errors:** inline field errors (client); 400 mapped to field messages; network/
  server failures → a user-friendly, retryable message; unavailable-course → a
  clear message with a path back to the course/catalogue. No internals exposed
  (SR-503).
- **Duplicate-submit protection (FR-518):** the submit control is disabled while
  `submitting`; after `success` the form transitions to the confirmation state and
  cannot be resubmitted. No auth/idempotency-key machinery.
- **Privacy (FR-519, FR-516):** only justified fields; a visible synthetic-data/
  demonstration notice on the form and confirmation.
- **Logging (SR-504):** rely on the Spec 01 request logger (method/path/status/
  duration); do **not** add logs that include name/email/phone/message. If any
  enquiry logging is added, personal fields are omitted/redacted.

## 12. Testing Strategy (maps to §-tasks; steering: Vitest + supertest + Testing Library)

- **Unit — Enquiry Service (Team C):** with a fake repository, a fake Course
  Service, and injected id/clock: valid submit returns a deterministic reference and
  persists (FR-512–FR-514, NFR-506); unknown/non-listable course → typed error
  (FR-510); course title captured.
- **Unit — Enquiry validation/schema:** required fields, email format, optional
  phone, message length bounds, enum, max lengths (FR-509, SR-502).
- **Unit — Repository:** `create` stores; `findByReference` hit/miss (FR-513).
- **API — supertest:** `POST /api/enquiries` happy → 201 with reference (FR-511,
  FR-512); invalid body → 400 with details (FR-508, SR-501, SR-503); unknown course
  → mapped error (FR-510); envelope consistency; confirm no PII is logged
  (assert via a captured logger/spy) (SR-504).
- **Frontend — Testing Library (faked `enquiriesApi`/`coursesApi`):** entry with
  course association (FR-501, FR-502); client validation errors (FR-506); successful
  submit → confirmation with reference/course/status/next-steps (FR-515);
  duplicate-submit disabled while submitting (FR-518); error state on failure
  (FR-517); unavailable-course handling (FR-503, FR-517); privacy notice present
  (FR-516, FR-519); accessibility (labels, error association, aria-live) (NFR-504).
- **Integration (this spec's own):** client form → real `POST /api/enquiries`
  (in-process app) happy-path + validation-rejection, keeping cross-feature
  navigation integration for Spec 06/07.
- **Determinism:** injected id/clock make reference numbers and results
  reproducible (NFR-506).

## 13. Future Transformation (Phase 2 — forward-looking note only)

The human enquiry capability is a clean Service behind a REST endpoint. A future,
separate specification could later expose `prepare_enquiry` / `validate_enquiry` /
`submit_enquiry`-style capabilities — where an agent-driven WRITE would require
explicit human confirmation under the documented safety model. **No** agent,
WebMCP, MCP, tool, registry, permission, confirmation policy, or AI-model code is
designed or created here.

## 14. Reuse Summary

| Reused artifact | Source | Usage |
| --------------- | ------ | ----- |
| `validate` middleware, `ApiError`, error handler, async handler | Spec 01 `server/src/http/*` | Boundary validation + sanitised errors |
| Logger, env/config, Helmet/CORS, `express.json()` | Spec 01 | Logging, config, security, body parsing |
| Course Service `getById` | Spec 02 | Verify referenced course exists/listable |
| Course type + label maps, `coursesApi.getById` | Spec 02 | Display associated course; verify on client |
| Client API boundary/transport | Spec 01 | `enquiriesApi.submit` transport |
| `Button`, `Card`, `Container`, `cn` | Spec 01 | Form/confirmation primitives/styling |
| Details/enquiry navigation | Spec 03 (links here) | Entry point into the form |

## 15. Architecture Decisions

| ID | Decision | Rationale |
| -- | -------- | --------- |
| AD-501 | Add Enquiry as a full backend capability using Spec 01 layering | First WRITE; consistent architecture; testable |
| AD-502 | Backend re-validates every enquiry with Zod (authoritative) | Trust boundary; client validation is UX only (SR-501) |
| AD-503 | In-memory `EnquiryRepository` behind an interface | Synthetic MVP storage; swappable later (no DB) |
| AD-504 | Verify course via existing Course Service `getById` | Reuse; no duplicate course logic (FR-510) |
| AD-505 | Injected id generator + clock for reference numbers | Deterministic, testable synthetic references (FR-514) |
| AD-506 | `POST /api/enquiries` returns 201 with reference envelope | REST + Spec 01 envelope consistency |
| AD-507 | No PII in logs; request-level logging only | Privacy/security (SR-504) |
| AD-508 | Duplicate-submit handled via disabled control + confirmation state | Reasonable protection; no auth/idempotency machinery (FR-518) |
| AD-509 | Spec 05 owns the enquiry entry route/param contract | Single owner for the shared navigation contract |
| AD-510 | No Course-model changes | Protect the shared contract across parallel teams |

## 16. Consistency Check

Every FR/NFR/SR in `requirements.md` maps to a design section here and to at least
one task in `tasks.md`. This design extends Spec 01/02, reuses their foundations,
adds only the Enquiry capability + form, and contains no AI-agent/WebMCP design
beyond the conceptual note in §13.
