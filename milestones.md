# Milestones

## 2026-06-23 - Staff UI dropdown and dark mode polish

- Replaced remaining staff/admin native selects in handover, return, fleet and
  management forms with the shared custom dropdown component backed by hidden
  form values.
- Raised open dropdown panels above neighboring cards so table menus are not
  clipped by return/fleet panels.
- Made the sticky topbar visually solid during scroll and separated the staff
  overview label from the report/export section.
- Added light/dark/system theme support with localStorage persistence, mobile
  dock access and dark-mode tokens for panels, tables, dropdowns, charts, map
  frames and the Three.js hero frame.
- Rounded and normalized report/status chart bars so the colored fill matches
  the pill-shaped track.

## 2026-06-23 - Tech stack diagram for deployed platform

- Added local SVG logo assets and a Playwright renderer for the deployment tech
  stack diagram used by both report and slide outputs.
- Rendered the logo-based stack chart for Cloudflare Tunnel, GCP Compute Engine,
  Docker/Node.js, JavaScript/GSAP/Three.js/Leaflet and SQLite.
- Inserted the chart into the system architecture report section and replaced
  the GCP architecture slide with the deployed stack view.
- Updated README with the `npm run diagrams:techstack` command.

## 2026-06-22 - App-style report and slide variants

- Added parallel app-style LaTeX sources and PDFs for the report and slide deck
  so the submitted document can follow the platform's dark-green/mint interface
  language without overwriting the existing `main.pdf`, `slides.pdf` or
  `slide.pdf`.
- Styled the new report cover, headers, footers, section labels, chips and
  panel cards with the same Civic Mobility palette used by the app.
- Styled the new slide deck with a dark-green title/sidebar treatment, grid
  canvas, app-like frame header and footer, and preserved the current cropped UI
  evidence slides.
- Updated README with the separate app-style artifact paths and build commands.

## 2026-06-22 - 3D/UI polish from improvement proposal

- Applied the 3D scene proposal with responsive orthographic framing for auth,
  dashboard hero and mobile containers, removing the auth-page CSS canvas zoom.
- Stabilized the moving-bike direction and wheel spin loop, skipped zero-length
  pedestrian path segments and cached status-light scale updates.
- Added bike-lane markings and reusable tree materials so the scene reads more
  clearly in compact hero frames.
- Preserved the Three.js canvas when re-rendering the same app view to avoid
  unnecessary remount flicker.
- Added a `/gd` skeleton loading state while stations/bikes are fetched for the
  demo director.
- Raised report dropdown menus above sticky chrome, compacted mobile bike-card
  rows and allowed narrow section headings to wrap without horizontal overflow.
- Updated README and report implementation notes for responsive scene fitting
  and `/gd` loading behavior.

## 2026-06-19 - UC001 evidence and CI automation

- Added a Playwright screenshot capture script for UC001 account registration,
  email verification and alternative flow 1 missing required information.
- Added the generated UC001 action sequence screenshots into the report source
  and rebuilt the submitted `pdf/main.pdf`.
- Added README badges for CI, passing tests, backend coverage, Node.js version
  and Docker build validation.
- Added GitHub Actions CI automation for syntax checks, Node.js coverage tests,
  UI smoke, UC smoke and deployable Docker image build.
- Added a lightweight inline validation toast for registration required fields
  so alternative flow 1 is visible in the real UI and captured report evidence.

## 2026-06-19 - Report claim implementation closure

- Added demo-local email verification and password recovery APIs/UI so UC001
  account verification and recover-access claims now have concrete behavior.
- Upgraded password storage to PBKDF2 salted hashes while keeping legacy
  SHA-256 hashes login-compatible and rehashing them after successful login.
- Added resident-card pending/rejected handling, blocked CCCD/CMND policy,
  account status updates and API/UI controls for admin demo of identity
  alternative flows.
- Scoped station staff to their assigned station for pickup/handover/fleet/report
  operations while keeping admin/operator global for demo support.
- Added pre-handover bike exchange for pending requests and UI controls for
  staff to swap to another available bike at the same pickup station.
- Added last-known location fallback in the customer station search UI so GPS/map
  failure can be demonstrated without breaking the main rental flow.
- Added `docs/3d_scene_agent_brief.md` to hand off the current Three.js scene
  constraints, composition goals and acceptance checks to an external visual
  agent without changing the app contract.
- Expanded backend tests and Playwright smoke tests for password policy, email
  verification, password reset, blocked identity, resident pending status, staff
  scope, exchange-bike and the updated staff return flow.
- Updated README and report sections so implemented behavior, APIs, schema and
  limitations match the current codebase.

## 2026-06-16 - Demo director and rental timing polish

- Replaced the native rental-duration select inside bike cards with the shared
  styled custom dropdown, keeping the hidden duration value used by the rental
  request flow.
- Fixed mobile bike-card layout so duration controls use the full card width and
  do not create body-level horizontal overflow.
- Added the `/gd` demo director as the main presentation route, combining road
  snapped bike GPS controls with a staff/admin system clock simulator; `/gps`
  remains an alias for older links.
- Added backend demo-clock state so handover, request expiry, return defaults,
  late-fee calculation and audit logs can use the same internal time across
  customer/admin/demo tabs.
- Added renter-aware bike availability labels so customers can distinguish
  `Chờ bạn nhận`, `Bạn đang thuê`, `Người khác giữ` and `Người khác thuê`.
- Applied the updated `scene (2).js` Three.js scene with a wider lake, more trees
  and side-on road framing, while preserving module-level cleanup and canvas
  pixel test support.
- Converted staff/admin operations tables to labeled row cards on mobile and
  medium desktop widths, then added a UI smoke assertion so report/request/fleet
  tables no longer clip inside narrow panels.
- Replaced native report filter selects with custom dropdowns and aligned the
  report money charts so weekly/monthly bars use the same money scale.
- Hardened the UI smoke cleanup so Playwright closes the browser even when a
  viewport assertion fails.
- Updated tests, screenshots, README and PDF/slide text for `/gd`, internal time
  simulation and clearer rental status labeling.

## 2026-06-16 - Customer bike card width fix

- Changed the customer available-bike grid to use a minimum card width so it can
  render one or two cards per row depending on available space without squeezing
  the three-zone layout: visual, bike information and rent controls.
- Refreshed the customer desktop screenshot used in the report so the submitted
  PDF matches the current UI.

## 2026-06-15 - Report submission diagram and operations dashboard pass

- Reframed `pdf/main.pdf` as a submission report aligned to the required
  sections: requirements, use cases, user stories, architecture, component design,
  database, UI, implementation, API and testing/evaluation.
- Added report-ready diagrams for system architecture, component architecture,
  rental lifecycle, sequence flows, activity flow, UI screen flow and database
  relationships.
- Added operations report charts for revenue by period, fleet status distribution
  and rental/late-fee trends using existing report data.
- Added an API and UI audit-log view for bicycle status changes, backed by
  `bike_status_logs`.
- Recreated `pdf/slides.tex` as a concise presentation deck aligned with the
  report and demo flow.
- Reworked the report cover page with the HUST/SOICT title-page style, SOICT
  logo and presenter names/MSSV from the class list.
- Renamed the report/slide front matter to present the product as the Ecopark
  Bicycle Parking Platform and added mobile UI evidence to the report/slide.
- Updated report/slide architecture wording to target Google Cloud Platform with
  Cloud Run/Compute Engine containers, SQLite demo storage and Cloud SQL/persistent
  disk as the production persistence path.
- Added Dockerfile and `.dockerignore` so the platform has a concrete GCP deploy
  artifact for the presentation.
- Reworked dense section 4-7 diagrams and promoted the mobile UI evidence figure
  to a dedicated report page for readability.
- Updated README/PDF/test coverage notes for charts, audit logs and report export
  evidence.

## 2026-06-15 - Mobile command shell consolidation

- Reworked the mobile workspace shell so the dashboard starts with the 3D scene
  hero instead of a separate topbar.
- Converted the dark command rail into a bottom floating icon-only dock on narrow
  screens, keeping labels as `title`/`aria-label` for accessibility.
- Added mobile-only refresh/logout icons to the bottom dock and compacted the
  hero metrics into a three-column row.
- Updated README and PDF implementation notes for the mobile command shell.

## 2026-06-15 - Production label polish

- Removed visible demo/prototype titles from the auth, dashboard and `/gps`
  screens while keeping the underlying seeded-account and GPS presentation
  helpers intact for smoke tests and classroom walkthroughs.
- Replaced exposed English workspace labels with Vietnamese operational copy so
  the UI reads less like a generated prototype.
- Rewrote the auth hero copy around actual bike-rental actions and replaced the
  native registration customer-type select with the same styled custom dropdown
  pattern used by the station filters.
- Added registration validation for realistic renter input: full name, Vietnamese
  phone number, 9/12-digit CCCD/CMND, duplicate phone and duplicate identity.
- Added API tests for invalid registration input and phone normalization.
- Updated README/PDF notes to mention the custom registration customer-type
  dropdown and registration input validation alongside the station filter
  dropdowns.

## 2026-06-15 - Customer rental workspace consolidation

- Reorganized the customer workspace around a single `Thuê xe` flow that keeps
  location filters, map, nearby stations, available bikes and the rent action in
  one place.
- Reduced customer navigation to `Thuê xe`, `Lượt thuê` and `Tài khoản` so the
  screen reads like a renter-facing app instead of a compact admin dashboard.
- Moved the GPS/manual location state into the station map as an overlay chip,
  keeping location metadata inside the map context.
- Repacked available-bike cards into a horizontal layout that keeps the bicycle
  illustration large while placing type/status and the rent controls in the same
  compact decision area.
- Updated README/PDF implementation notes for the customer flow consolidation.

## 2026-06-15 - Claude 3D scene upgrade

- Applied the Claude-provided `scene (1).js` low-poly Bike Hub scene into
  `public/scene.js`.
- Kept the app contract intact: `/vendor/three.module.js` import, `mountScene`,
  module-level self-cleanup, local generated canvas texture and
  `preserveDrawingBuffer` for canvas pixel smoke tests.
- Adjusted the imported camera framing so the road stays horizontal in compact
  hero frames while preserving the elevated view and Claude's lake, tree, bike
  and pedestrian improvements.
- Reframed the auth-page scene as a wide preview strip aligned with the hero
  copy, removing the loose decorative line and thumbnail-like placement.
- Updated README and PDF implementation notes for the low-poly Three.js scene.

## 2026-06-15 - Concurrent demo session hardening

- Extended the UC smoke test so `/gps` stays open in a separate browser context
  while the app handles the maximum demo load of two customer sessions and two
  admin/operator sessions at the same time.
- Verified the GPS operator context can still snap the bike marker near/far and
  remains unauthenticated after another customer logs out.
- Updated README and PDF implementation notes to distinguish the normal 1 user +
  1 admin + 1 GPS tab demo from the larger max-load coverage.

## 2026-06-12 - Three.js scene landscape pass

- Enlarged the decorative lake in the Three.js Bike Hub scene with a shore band,
  foam edge and small ripple details so water remains visible in the compact hero
  containers.
- Expanded the tree placement into clearer green belts around the road and lake
  while keeping the existing `mountScene(target)` API, self-cleanup behavior and
  local asset constraints.
- Reoriented the Three.js camera so the main road reads horizontally in compact
  hero frames while retaining the elevated angled view.
- Added a lane-bound moving bicycle, small animated pedestrians and subtle tree
  sway loops to make the hero scene feel alive without changing app contracts.
- Updated README and PDF web implementation notes for the lake/tree visual pass.

## 2026-06-11 - Civic command fancy UI branch

- Created branch `ui/civic-command-fancy` for the named design-system pass.
- Reframed the application visual language as Civic Mobility Command Center:
  dark command rail, bright workspace, crisp operational panels and restrained
  green/sky/amber accents.
- Added a persistent workspace rail with role-aware scroll targets and live local
  status while preserving the existing Customer/Admin/Staff feature set.
- Replaced the toy-like hero 3D island with a cleaner isometric Bike Hub scene:
  internal road, bike lane, canopy, dock/rack, status lights, trees and visually
  distinct City/Tandem/Child-seat bicycles.
- Restyled auth, dashboard hero, tables, cards, map panels, custom dropdowns,
  native selects, session chip and `/gps` demo panels so the interface feels
  closer to production operations software and less like a generic generated UI.
- Verified the redesign with desktop/mobile screenshots, open-dropdown review,
  backend tests and Playwright smoke tests for UI and UC flows.
- Updated README and PDF implementation notes for the Civic Mobility Command
  Center design direction.

## 2026-06-11 - GSAP production UI branch

- Created branch `ui/gsap-production-grade` for the UI refinement pass.
- Added GSAP as a local npm dependency and served it through the existing
  `/vendor` static path.
- Upgraded the auth and dashboard interface with clearer hierarchy, sticky
  topbar behavior, stronger form/table/card states and responsive scroll reset
  when switching workspaces.
- Added GSAP timeline entrances, hover microinteractions and toast motion with
  `prefers-reduced-motion` support.
- Fixed medium-width operations tables so active rentals and fleet rows wrap or
  scroll inside their panels instead of squeezing text and controls together.
- Upgraded the Three.js hero scene with a more detailed bike parking island,
  rack/sign elements and distinct city/tandem/child-seat bicycles; bike cards now
  render type-specific SVG illustrations.
- Exposed the UC002 alternative paths for manual search/no nearby stations and
  cancel-before-pickup, with API-backed request cancellation and automatic pending
  request expiry.
- Reworked UC003 handover controls so staff must confirm document type/number,
  200k deposit and held document before converting a request to a rental.
- Extended UC004 return controls with return station, return time, bicycle
  condition, condition note and a visible ticket summary after issuance.
- Extended UC005 operations with station update, bike update/locate, status-change
  reasons, report filters by station/bike and CSV export.
- Extended the Playwright UI smoke test to verify that GSAP loads before checking
  Three.js canvas rendering, Leaflet markers, console errors and page overflow.
- Added a Playwright UC pipeline smoke test covering GPS marker, manual-location
  empty state, request/cancel, request/handover, return-ticket and report export.
- Replaced customer station-search dropdowns with styled custom dropdown controls
  and added a dedicated return pipeline panel so UC004 is visible before and
  after active rentals exist.
- Added `/gps` demo console for UC presentation, with draggable bike GPS snapped
  to an internal road polyline so the demo route follows roads near pickup/return
  stations instead of crossing lakes or buildings.
- Added a second seeded admin account and concurrent-session coverage so two
  customers and two admins can stay logged in at the same time during demos.
- Updated README and PDF web implementation notes for the GSAP-based UI layer.

## 2026-05-19 - Web implementation baseline

- Completed local fullstack web app for Ecopark Bicycle Parking.
- Implemented Customer flows for account, resident discount evidence, station
  search, bike selection, rental request and rental history.
- Implemented Staff/Admin flows for handover, deposit, return, ticket issuance,
  bike status/location management and reports.
- Added SQLite schema/seed data aligned with the requirement analysis tables.
- Added backend tests for registration, availability, handover, return pricing
  and report aggregation.
- Completed three UI refinement passes with screenshot review for auth,
  customer mobile and admin desktop states, including layout density, toast
  placement, responsive hero sizing and 3D scene balance.
- Replaced the schematic customer station map with a usable Leaflet/OpenStreetMap
  map, keeping station markers connected to the rental selection flow.
- Updated README and PDF documentation for the web implementation.

## Notes

- Mindmap/drawio: `docs/BikeSharing_UseCase_Diagrams.drawio` was reviewed; no
  update required because the implementation follows the existing UC001-UC005
  scope without changing use-case semantics.
- Mindmap/drawio 2026-06-11: reviewed again for the GSAP UI refinement; no update
  required because the changes affect presentation quality and motion only, not
  the use-case scope or actor interactions.
- Mindmap/drawio 2026-06-11 UC flow pass: reviewed again; no update required
  because the UI now activates the documented UC001-UC005 main/alternative flows
  without introducing new actors or new use cases.
- Mindmap/drawio 2026-06-11 GPS demo route: reviewed; no update required because
  `/gps` is a presentation aid for existing UC002/UC004 location behavior, not a
  new use case or actor interaction.
- Mindmap/drawio 2026-06-11 styled dropdown pass: reviewed; no update required
  because this only changes control presentation for the existing UC002 station
  search filters.
- Mindmap/drawio 2026-06-11 concurrent demo sessions: reviewed; no update
  required because this only adds extra seeded accounts and session isolation for
  the existing Customer/Admin actors.
- Mindmap/drawio 2026-06-11 Civic command fancy UI: reviewed; no update required
  because the change only affects visual language, layout density and motion
  presentation for existing UC001-UC005 screens.
- Mindmap/drawio 2026-06-12 3D Bike Hub scene: reviewed; no update required
  because the change only replaces the decorative Three.js scene and does not
  change use-case scope, actors or flow semantics.
- Mindmap/drawio 2026-06-12 lake/tree scene pass: reviewed; no update required
  because the change only improves visual landscape elements inside the decorative
  Three.js scene, not use-case scope, actors or flow semantics.
- Mindmap/drawio 2026-06-12 animated scene pass: reviewed; no update required
  because the moving bike and pedestrians are decorative presentation details, not
  new use cases, actors or system interactions.
- Mindmap/drawio 2026-06-15 concurrent demo session hardening: reviewed; no
  update required because this strengthens demo concurrency coverage for existing
  Customer/Admin actors and the existing `/gps` presentation aid.
- Mindmap/drawio 2026-06-15 Claude 3D scene upgrade: reviewed; no update required
  because this only replaces the decorative Three.js scene implementation and
  does not change use-case scope, actors or system interactions.
- Mindmap/drawio 2026-06-15 mobile command shell consolidation: reviewed; no
  update required because this only changes responsive navigation presentation
  for existing screens and actors.
- Mindmap/drawio 2026-06-15 auth scene balance: reviewed; no update required
  because this only changes decorative auth-page scene placement and responsive
  spacing, not use-case scope, actors or system interactions.
- Mindmap/drawio 2026-06-15 production label polish: reviewed; no update
  required because this only changes visible labels for existing screens and
  does not change use-case scope, actors or system interactions.
- Mindmap/drawio 2026-06-15 registration dropdown polish: reviewed; no update
  required because the customer type field still maps to existing UC001 data and
  does not change actors, use-case scope or system interactions.
- Mindmap/drawio 2026-06-15 registration validation: reviewed; no update
  required because this implements UC001 validation already documented for the
  existing Customer actor and does not add a new use case.
- Mindmap/drawio 2026-06-15 customer rental workspace consolidation: reviewed;
  no update required because this reorganizes existing UC002 customer UI sections
  without adding actors, use cases or system interactions.
- Mindmap/drawio 2026-06-15 report submission pass: reviewed; no semantic update
  required because existing UC001-UC005 remain the same, while report diagrams add
  architecture, data, UI and implementation views around the same use cases.
- Mindmap/drawio 2026-06-22 3D/UI polish proposal: reviewed; no update required
  because this changes only responsive rendering, loading states and visual polish
  for existing screens, not actor interactions or UC001-UC005 scope.
- Version bump: N/A because the repo has no `VERSION` or `versioning.py`.
