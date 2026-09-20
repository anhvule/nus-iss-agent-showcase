# Specification 06 — Human Website Integration & Completion · Tasks

**Project:** EduAgent Connect — WebMCP-Ready Education Website Demonstrator
**Spec ID:** 06-human-website-integration
**Owner:** Integration Lead (feature seams provided by Teams A–D)
**Traceability:** Each task references requirements in `./requirements.md` and design sections in `./design.md`.

> **Specification phase only.** These are **future implementation task
> definitions**. Do **not** execute them now and do **not** mark them complete
> during the specification phase. **No task implements WebMCP, agents, MCP, tools,
> or AI** (Phase 2). Integration must not change feature internals or the shared
> Course model, and adds no new backend endpoints.

Priority: **High** · **Medium** · **Low**. Each task lists **Dependencies**,
**Acceptance criteria**, and **Validation**.

---

## PHASE 0 — Contracts & Conflict Resolution

### TASK-600 — Review Specs 01–05 integration points
- **Priority:** High
- **Dependencies:** Specs 01–05 approved
- **Description:** Review all cross-feature seams and the consolidated contracts
  (requirements §10, `App/docs/phase-1-integration.md`): catalogue card seams,
  details affordances, comparison interface/route, enquiry route/API, and Spec 01
  shell/infra.
- **Acceptance criteria:** A written inventory of every integration point (C1–C9)
  with its owner and consumer confirmed.
- **Validation:** Inventory reviewed against Specs 02–05; no missing seam.

### TASK-601 — Validate shared contracts (C1–C9)
- **Priority:** High
- **Dependencies:** TASK-600
- **Description:** Verify each contract's input/output/owner/consumer is consistent
  across the specs (Course model C1, Course ID C2, course API C3, details route C4,
  comparison interface C5, comparison route C6, enquiry route C7, enquiry API C8,
  Spec 01 infra C9).
- **Acceptance criteria:** Every contract confirmed consistent, or a conflict is
  logged (TASK-603); the Course model (C1) is confirmed **unchanged**.
- **Validation:** Cross-check against Specs 02–05 requirements/design; satisfies
  FR-611, NFR-602.

### TASK-602 — Confirm route shapes (comparison & catalogue query)
- **Priority:** High
- **Dependencies:** TASK-601
- **Description:** Confirm the final comparison route path and its Next.js routing
  precedence relative to the dynamic `[courseId]` route; confirm catalogue query
  params are preserved on return (CQ-2).
- **Acceptance criteria:** Comparison route path decided and non-colliding;
  catalogue query preserved on "back to catalogue".
- **Validation:** Documented decision; deep-link + back-navigation checks planned.
  Satisfies FR-619, FR-624, FR-626.

### TASK-603 — Resolve documented contract conflicts (CQ-1..CQ-5)
- **Priority:** High
- **Dependencies:** TASK-601
- **Description:** Drive resolution of the recorded conflicts: enquiry route shape
  (CQ-1), comparison route (CQ-2), top-level alias decision (CQ-3), provider mount
  ownership (CQ-4), global notification pattern (CQ-5). Where a resolution requires
  changing a prior spec (e.g. fixing the enquiry route in Spec 05), raise it as an
  explicit **shared-contract change** to that spec's owner — do **not** modify prior
  specs silently.
- **Acceptance criteria:** Each CQ has a documented, approved resolution and an
  assigned owner; consumers know the final values.
- **Validation:** Resolutions recorded in `App/docs/phase-1-integration.md`;
  satisfies requirements §11, FR-626, CQ-1..CQ-5.

---

## PHASE 1 — Shared Shell & Cross-Feature State

### TASK-604 — Add `AppProviders` and mount the comparison + notification providers
- **Priority:** High
- **Dependencies:** TASK-603; Spec 04 `ComparisonProvider` available
- **Description:** Introduce an integration-owned `AppProviders` client wrapper in
  the Spec 01 shell; mount Spec 04's `ComparisonProvider` (owned by Team C) and a
  new shell-level `NotificationProvider` (§design §3, §5). No business logic in the
  wrapper; no feature internals changed.
- **Acceptance criteria:** Comparison state is shared across catalogue/details/
  comparison in a session; a global notification channel exists.
- **Validation:** Add-a-course-then-see-it-everywhere check; provider unit/render
  test. Satisfies FR-623, FR-621; verifies AC-602, AC-604.

### TASK-605 — Complete global navigation (primary + Lifelong-Learning sub-nav)
- **Priority:** High
- **Dependencies:** TASK-602, TASK-604
- **Description:** Reuse the Spec 01 header/primary nav; add a shared
  Lifelong-Learning sub-navigation exposing Course Catalogue and Compare within the
  LL area (§design §4).
- **Acceptance criteria:** Primary nav works from all pages with the active section
  indicated; LL sub-nav reaches the catalogue and comparison view.
- **Validation:** Nav render/active-state tests. Satisfies FR-614, FR-615;
  verifies AC-610.

### TASK-606 — Complete header/footer
- **Priority:** Medium
- **Dependencies:** TASK-605
- **Description:** Keep the consistent header on every page; extend the footer with
  useful secondary links (e.g. to catalogue/sections) while retaining the
  synthetic-data/demonstration notice (§design §4/§5).
- **Acceptance criteria:** Header and footer render consistently on every page;
  footer includes the demo notice and useful links.
- **Validation:** Footer/header presence tests on representative routes. Satisfies
  FR-616.

### TASK-607 — Add reusable breadcrumbs on course routes
- **Priority:** Medium
- **Dependencies:** TASK-605
- **Description:** Implement an accessible `Breadcrumbs` shell component (semantic
  `nav` + ordered list, `aria-current` on the last crumb) and place it on catalogue,
  details, comparison, and enquiry routes with labels derived from loaded data
  (§design §4).
- **Acceptance criteria:** Correct breadcrumb trail on each course route; last crumb
  marked current.
- **Validation:** Breadcrumb render/semantics tests. Satisfies FR-617; verifies
  AC-611.

---

## PHASE 2 — Cross-Feature Navigation Wiring

### TASK-608 — Integrate Catalogue → Details
- **Priority:** High
- **Dependencies:** TASK-601 (C4); Specs 02, 03 implemented
- **Description:** Ensure the catalogue card "View Details" navigates to the details
  route with the correct `courseId` (seam confirmation/wiring; no feature-internal
  change).
- **Acceptance criteria:** Activating "View Details" opens the correct course.
- **Validation:** Seam test (stubbed router / `href` assertion). Satisfies FR-601;
  verifies AC-601.

### TASK-609 — Integrate Catalogue → Comparison
- **Priority:** High
- **Dependencies:** TASK-604 (provider), Spec 04 add control
- **Description:** Wire the catalogue card's add-to-compare control (via
  `useComparison`) and expose a way to open the comparison view (e.g. the
  comparison bar/count).
- **Acceptance criteria:** Adding from a card updates comparison state/count and the
  course appears in the comparison view.
- **Validation:** Add-then-open-comparison seam test. Satisfies FR-602, FR-623;
  verifies AC-602.

### TASK-610 — Integrate Details → Catalogue / Details → Comparison
- **Priority:** High
- **Dependencies:** TASK-604, Spec 03 affordances
- **Description:** Confirm "Back to catalogue" from Details restores prior catalogue
  query state (URL), and wire the optional add-to-compare affordance on Details via
  the shared interface.
- **Acceptance criteria:** Back returns to the prior catalogue view; add-to-compare
  on Details updates shared state everywhere.
- **Validation:** Back-navigation + add-from-details seam tests. Satisfies FR-603,
  FR-604, FR-624; verifies AC-603, AC-604.

### TASK-611 — Integrate Details → Enquiry
- **Priority:** High
- **Dependencies:** TASK-603 (CQ-1), Specs 03, 05
- **Description:** Wire the Details "Enquire" action to the confirmed enquiry entry
  route, carrying the `courseId`.
- **Acceptance criteria:** Enquire opens the enquiry form associated with the same
  course id.
- **Validation:** Seam test asserting the enquiry route/param + course association.
  Satisfies FR-605, FR-613; verifies AC-605.

### TASK-612 — Integrate Comparison → Details / → Enquiry / → Catalogue
- **Priority:** High
- **Dependencies:** TASK-603 (CQ-1), Specs 04, 03, 05
- **Description:** Wire the comparison view's per-course actions: open details
  (C4 route), enquire (C7 route, carrying `courseId`), and return to catalogue.
- **Acceptance criteria:** Each action navigates correctly with the right course
  identity.
- **Validation:** Seam tests for each action. Satisfies FR-606, FR-607, FR-608,
  FR-613; verifies AC-606, AC-607.

### TASK-613 — Integrate Enquiry → Confirmation → return path
- **Priority:** High
- **Dependencies:** Spec 05
- **Description:** Confirm a successful submission ends in the confirmation state and
  provides a clear path back to a relevant location (course details / catalogue /
  Lifelong Learning); optionally surface a global notification (TASK-604).
- **Acceptance criteria:** Successful enquiry shows confirmation with reference and a
  working return path.
- **Validation:** Flow seam test with a faked enquiry API. Satisfies FR-609, FR-610;
  verifies AC-608.

---

## PHASE 3 — Global UI, States & Missing Shell

### TASK-614 — Standardise global UI patterns
- **Priority:** Medium
- **Dependencies:** TASK-604
- **Description:** Publish and apply the UI-consistency guide (buttons, forms, cards,
  status/availability, request-state union, layout) reusing Spec 01 primitives and
  Spec 02 conventions; align any inconsistencies at the shell level only (§design §5).
- **Acceptance criteria:** Features present consistent buttons/forms/cards/status;
  documented guide exists.
- **Validation:** Visual/spot checks + component tests where practical. Satisfies
  FR-620, NFR-604.

### TASK-615 — Implement the global notification pattern
- **Priority:** Medium
- **Dependencies:** TASK-604
- **Description:** Implement `useNotify()` over the `NotificationProvider`, rendering
  accessible `aria-live` status messages; adopt it for cross-feature feedback
  (e.g. enquiry submitted, comparison limit reached) without removing valid local
  states.
- **Acceptance criteria:** Cross-feature feedback appears in an accessible,
  colour-independent notification region.
- **Validation:** Notification render/aria-live tests. Satisfies FR-621; verifies
  AC-608 (feedback), AC-615 (announcements).

### TASK-616 — Complete global error handling (404 + consistency)
- **Priority:** High
- **Dependencies:** TASK-605
- **Description:** Add a global `not-found` page for unknown routes with a path back
  into the site; ensure invalid/unavailable-course, API-failure/network, and
  failed-enquiry states use consistent patterns/copy across features (§design §8).
- **Acceptance criteria:** Unknown routes show a consistent 404; invalid-course /
  API-failure / failed-enquiry states are consistent and never expose internals.
- **Validation:** 404 route test; consistency review across features. Satisfies
  FR-627, FR-628, FR-629, FR-631; verifies AC-612.

### TASK-617 — Complete global loading/empty state consistency
- **Priority:** Medium
- **Dependencies:** TASK-614
- **Description:** Ensure loading and empty states (no catalogue results, empty
  comparison) follow the shared patterns with clear next steps (§design §8).
- **Acceptance criteria:** Loading and empty states are consistent and provide
  guidance.
- **Validation:** Empty/loading render checks. Satisfies FR-630; verifies AC-613.

### TASK-618 — Complete missing human-website shell pieces
- **Priority:** Medium
- **Dependencies:** TASK-605, TASK-607
- **Description:** Complete remaining Phase-1 shell items: a Lifelong-Learning
  landing that surfaces catalogue/compare, consistent page metadata/titles, and any
  agreed route alias/redirect (only if approved in TASK-603/CQ-3). Do **not** expand
  beyond Phase 1.
- **Acceptance criteria:** LL landing surfaces the course journeys; page titles are
  consistent; alias behaves as decided (or is absent by default).
- **Validation:** Metadata/landing checks; alias redirect check if applicable.
  Satisfies FR-615, FR-622, FR-625, FR-626.

---

## PHASE 4 — Responsive & Accessibility Integration

### TASK-619 — Validate responsive integration (incl. mobile navigation)
- **Priority:** High
- **Dependencies:** TASK-605, TASK-607, TASK-616
- **Description:** Provide a usable mobile navigation pattern for primary + LL
  sub-nav and verify the journey is consistent across mobile/tablet/desktop
  (§design §9).
- **Acceptance criteria:** Navigation and journeys are usable at all breakpoints
  (not a shrunken desktop layout).
- **Validation:** Responsive checks/manual breakpoint review. Satisfies NFR-606;
  verifies AC-614.

### TASK-620 — Validate accessibility integration (incl. focus management)
- **Priority:** High
- **Dependencies:** TASK-605, TASK-607, TASK-615, TASK-616
- **Description:** Verify site-wide landmarks/heading order, keyboard traversal of
  the full journey, visible focus, breadcrumb semantics, aria-live announcements,
  and sensible focus management on client-side route changes (§design §10).
- **Acceptance criteria:** Keyboard-only users can complete the whole journey with
  visible focus and announced status; heading/landmark structure is correct.
- **Validation:** Keyboard/a11y integration checks. Satisfies NFR-605; verifies
  AC-615.

---

## PHASE 5 — Integration Testing & Journey Validation

### TASK-621 — Integration/seam tests
- **Priority:** High
- **Dependencies:** TASK-608–TASK-613, TASK-616 (and test tooling from Spec 02)
- **Description:** Implement seam tests for each cross-feature navigation path and
  Course-ID continuity, comparison-state sharing, breadcrumb correctness, the global
  404, and the notification pattern — using stubbed routers/faked API clients.
- **Acceptance criteria:** All seam tests pass deterministically.
- **Validation:** `npm run test` (client; server where relevant). Satisfies §16;
  verifies AC-601–AC-609, AC-611, AC-612.

### TASK-622 — End-to-end human journey validation
- **Priority:** High
- **Dependencies:** TASK-621
- **Description:** Validate the full journey Catalogue → Details → Comparison →
  Enquiry → Confirmation → return, including error/unavailable/empty paths, keeping
  scope to seam-level e2e (exhaustive e2e is Spec 07).
- **Acceptance criteria:** The end-to-end journey works with a stable Course ID and
  consistent states.
- **Validation:** Manual + automated journey checks against `App`. Satisfies §7,
  FR-601–FR-613; verifies AC-609.

### TASK-623 — Non-regression check (Specs 01–05)
- **Priority:** High
- **Dependencies:** TASK-621
- **Description:** Confirm Spec 01 (health, shell) and Spec 02 (catalogue) still pass
  and Specs 03–05 still pass their own suites after integration.
- **Acceptance criteria:** No regressions in prior specs.
- **Validation:** Run existing suites + health/catalogue checks. Satisfies NFR-610;
  verifies AC-616.

---

## PHASE 6 — Documentation & Readiness

### TASK-624 — Documentation
- **Priority:** Medium
- **Dependencies:** TASK-603, TASK-618
- **Description:** Update `App/docs/phase-1-integration.md` with the final resolved
  contracts/routes, the shell/provider architecture, the UI-consistency guide, and
  the end-to-end journey; add a short integration section to the root/docs README.
  State that WebMCP/agent is a future phase.
- **Acceptance criteria:** Docs reflect the integrated site and final contracts.
- **Validation:** Doc review against the implemented integration. Satisfies
  requirements §10/§11, NFR-604.

### TASK-625 — Phase 1 integration readiness review
- **Priority:** High
- **Dependencies:** TASK-619–TASK-624
- **Description:** Run the full quality gates (`npm run typecheck`, `npm run lint`,
  server + client tests, production build) and confirm the Definition-of-Done for
  integration; hand off to Spec 07 for the formal quality/release-readiness gate.
- **Acceptance criteria:** Zero type/lint errors; all tests pass; build succeeds;
  integration DoD satisfied.
- **Validation:** Gate output captured; readiness sign-off recorded. Satisfies
  NFR-603, NFR-607, NFR-610.

---

## Traceability — Requirements → Tasks

| Requirement | Task(s) |
| ----------- | ------- |
| FR-601 | TASK-608 |
| FR-602 | TASK-609 |
| FR-603 | TASK-610 |
| FR-604 | TASK-610 |
| FR-605 | TASK-611 |
| FR-606 | TASK-612 |
| FR-607 | TASK-612 |
| FR-608 | TASK-612 |
| FR-609 | TASK-613 |
| FR-610 | TASK-613 |
| FR-611 | TASK-601 |
| FR-612 | TASK-601, TASK-621, TASK-622 |
| FR-613 | TASK-611, TASK-612, TASK-622 |
| FR-614 | TASK-605 |
| FR-615 | TASK-605, TASK-618 |
| FR-616 | TASK-606 |
| FR-617 | TASK-607 |
| FR-618 | TASK-605, TASK-619 |
| FR-619 | TASK-602 |
| FR-620 | TASK-614 |
| FR-621 | TASK-604, TASK-615 |
| FR-622 | TASK-618 |
| FR-623 | TASK-604, TASK-609 |
| FR-624 | TASK-602, TASK-610 |
| FR-625 | TASK-618 |
| FR-626 | TASK-602, TASK-603, TASK-618 |
| FR-627 | TASK-616 |
| FR-628 | TASK-616 |
| FR-629 | TASK-616 |
| FR-630 | TASK-617 |
| FR-631 | TASK-616 |
| NFR-601 | TASK-604, TASK-623 |
| NFR-602 | TASK-601 |
| NFR-603 | TASK-625 |
| NFR-604 | TASK-614, TASK-624 |
| NFR-605 | TASK-620 |
| NFR-606 | TASK-619 |
| NFR-607 | TASK-625 |
| NFR-608 | TASK-601, TASK-616 |
| NFR-609 | TASK-621 |
| NFR-610 | TASK-623, TASK-625 |

---

## Scope guard (explicitly NOT in this specification)

No task implements or designs: WebMCP, MCP, agent tools/registry/permissions, agent
orchestration, AI-model integration, an AI agent, AI recommendations/search/content,
new business features or course/enquiry logic, changes to the shared Course model,
new backend endpoints, authentication, accounts, payments, a production database, or
external/CRM/production integrations. The formal quality/release gate and exhaustive
e2e/a11y/responsive suite are owned by Specification 07.
