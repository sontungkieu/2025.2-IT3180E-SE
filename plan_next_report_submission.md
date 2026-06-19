# Report and Presentation Submission Plan

## Goal

Upgrade the existing use-case analysis package into a submission-ready report and
presentation for Ecopark Bicycle Parking.

## Findings from the requirement checklist

- Current `pdf/main.pdf` is strong on actors, business rules, relational schema
  and detailed use-case specifications.
- Missing or weak areas before this pass: explicit user stories, system
  architecture, component architecture, UI design evidence, API contract,
  testing/evaluation summary and a concise improvement roadmap.
- The reference report/repo uses many supporting diagrams such as ERD, package,
  activity, sequence, screen-flow and UI prototype images. For this project, the
  minimum useful set is system architecture, component architecture, rental
  lifecycle, database schema, UI screenshots and test/evaluation matrix.

## Backend assessment

- Good enough for classroom demo: role-based API, station staff scope,
  session isolation, email verification and password reset demo codes,
  PBKDF2 salted password hashes, blocked identity policy, station/bike
  inventory, rental request hold, pre-handover bike exchange, staff handover,
  return ticket, pricing, resident discount, dashboard charts, audit logs,
  reports, CSV export through the UI and a `/gd` demo director with shared
  internal clock for late-fee scenarios.
- Production limitations to state clearly: email verification/password recovery
  use demo-local codes rather than SMTP, session storage is in-memory, external
  map tiles require network, and deployment/migration/backup hardening is outside
  the classroom prototype.
- Optional next backend improvement after submission: real email delivery,
  server-side CSV/PDF report export, persistent session store, migration version
  tracking and richer report breakdowns by station, bike type and peak hour.
- Optional next UI improvement after submission: use `docs/3d_scene_agent_brief.md`
  as the handoff spec for a focused Three.js perspective/composition polish pass
  while preserving the current `public/scene.js` API and smoke-test contract.

## Report work items

- Reframe `pdf/main.tex` as a project report instead of a use-case-only document.
- Add sections required by `report_requirements.png`.
- Include screenshots from the current UI for the interface design section.
- Include a concrete UC001 action sequence: registration form, missing required
  field alternative flow, account status, demo email code and verified email.
- Include `/gd` screenshot as the combined GPS/time-control evidence for
  alternative-flow demonstration.
- Keep existing UC001--UC005 detail tables as report appendix-grade depth.
- Include the implemented chart dashboard and audit log in UI/API/testing sections.
- Build `pdf/main.pdf` and clean LaTeX intermediate files.
- Keep README badges aligned with latest CI/test/coverage status.

## Slide work items

- Replace the old 30+ slide use-case deck with a presentation deck focused on the
  story of the product, architecture, implementation and demo path.
- Keep the deck concise enough for group presentation.
- Build `pdf/slides.pdf`; also provide `pdf/slide.pdf` as a compatibility copy
  for the name used in the submission request.
