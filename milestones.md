# Milestones

## 2026-06-11 - Civic command fancy UI branch

- Created branch `ui/civic-command-fancy` for the named design-system pass.
- Reframed the application visual language as Civic Mobility Command Center:
  dark command rail, bright workspace, crisp operational panels and restrained
  green/sky/amber accents.
- Added a persistent workspace rail with role-aware scroll targets and live local
  status while preserving the existing Customer/Admin/Staff feature set.
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
- Version bump: N/A because the repo has no `VERSION` or `versioning.py`.
