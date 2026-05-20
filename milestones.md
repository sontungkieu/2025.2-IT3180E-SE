# Milestones

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
- Version bump: N/A because the repo has no `VERSION` or `versioning.py`.
