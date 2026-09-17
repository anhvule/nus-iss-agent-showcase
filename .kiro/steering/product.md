# Product — EduAgent Connect

## What this is

EduAgent Connect is a prototype that demonstrates how an education website can
become **Agent Ready** using a **WebMCP-style capability layer**. It shows how a
conversational agent (or the app itself) can safely discover courses, compare
them, prepare an enquiry, and submit it — always with explicit human control
over write actions.

This is a demonstration/prototype. It uses **synthetic education data** only.

## Primary user journey

The product is organised around one end-to-end learner journey:

1. **Learner request** — the learner expresses an intent (e.g. "find data
   analytics courses").
2. **Course discovery** — relevant courses are surfaced.
3. **Course details** — the learner inspects a specific course.
4. **Course comparison** — the learner compares shortlisted courses.
5. **Enquiry preparation** — an enquiry draft is assembled.
6. **Enquiry validation** — the draft is validated (client-side for UX,
   authoritatively on the backend).
7. **Explicit human confirmation** — the learner must explicitly approve before
   anything is submitted.
8. **Enquiry submission** — the confirmed enquiry is sent to the backend.
9. **Submission status** — the learner sees the outcome/status.

Each step maps to capabilities in the WebMCP layer and to REST endpoints on the
backend.

## Operation classification

Every capability is classified so agents and users can reason about safety:

- **READ** — retrieves data, no side effects (discovery, details, comparison,
  status).
- **NAVIGATION** — moves through the app, no data mutation.
- **WRITE** — mutates backend state (enquiry submission). Requires explicit
  human confirmation.

## Guardrails and scope

- Synthetic data only. **Do not scrape, modify, or integrate with Republic
  Polytechnic production systems.**
- **No authentication and no database** unless a later specification explicitly
  requires them.
- Business features are added incrementally through specifications. The current
  repository is the **foundation only** — no course/enquiry features are
  implemented yet.

## Non-goals (for the foundation)

- No course catalogue, comparison, or enquiry business logic yet.
- No user accounts, sessions, or persistence.
- No production integrations of any kind.
