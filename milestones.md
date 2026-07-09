# Milestones

## 2026-07-10 - Responsive UI glitch audit

- Audited auth, customer, staff/admin and `/gd` screens with live Playwright
  screenshots plus DOM checks for console errors, clipping and body overflow.
- Replaced the fixed 118 px operations scene strip at medium widths with a
  responsive 172-208 px frame so the 3D world no longer collapses into a small
  centered thumbnail.
- Expanded `/gd` mobile account chips to contain wrapped email, customer type
  and UC-session metadata without overlapping the next account.
- Added smoke coverage for medium operations scene pixel occupancy and mobile
  `/gd` chip overflow, and bumped the stylesheet cache key.
- Stabilized concurrent UC login checks against GSAP entrance frames by waiting
  for the workspace DOM and authenticated session instead of transient visibility.
- Updated README and the 3D scene brief. PDF is N/A on `main`; the use-case
  drawio and planning files are N/A because actors, flows and roadmap are
  unchanged.

## 2026-07-10 - 3D mobility garden redesign

- Preserved matched `430x226` before/after dashboard renders under `docs/ui/`
  so scene changes can be reviewed against the previous production state.
- Tightened the world footprint and responsive orthographic frustums so the hub,
  bicycles and lake occupy the compact hero instead of shrinking inside broad
  empty ground bands.
- Rebuilt the hub as a larger green-roof and solar canopy with glass backing,
  compact racks, readable signage and all docked bicycles inside its footprint.
- Replaced repetitive tree rows with varied tree and shrub clusters, refined the
  organic lake with offset ripples and lily pads, and added subtle contact shadows
  so the scene reads as a brighter Ecopark mobility garden with more depth.
- Kept the road horizontal while lowering the camera angle, corrected service-pad
  bike placement and retained surface-specific wheel clearance for static and
  moving bicycles.
- Updated README scene documentation and the external 3D brief. PDF is N/A on
  `main`; the use-case drawio is unchanged because this is decorative presentation
  work and does not alter actors, flows or UC001-UC005 scope.

## 2026-06-30 - 3D scene nature polish

- Brightened the Three.js scene palette with warmer meadow/path tones, lighter
  road markings, livelier tree greens and stronger daylight.
- Replaced the rectangular lake slab with an organic lakeside shape plus shore,
  walking paths, reeds and small flower clusters for a more natural Ecopark feel.
- Added a green/solar canopy treatment and a service pad for overflow bikes so
  parked bikes no longer sit in the active bike lane.
- Moved the child figure and pedestrian loop onto lakeside/plaza paths instead
  of water or road surfaces, fixing several illogical spatial details.
- Recentered the Three.js camera on the scene X axis and tightened responsive
  frustums so the road/base render straight and fill wide hero frames.
- Rebuilt the low-poly bicycles with upright wheel planes, spokes and triangular
  frame tubes so wheels no longer read as lying flat or detached from the bike.
- Raised bike ride heights separately for the lane and hub pad so tire bottoms
  sit on the visible surface instead of sinking into the road mesh.

## 2026-06-30 - Customer GPS source simplification

- Removed the customer-facing location preset dropdown from the rental workflow
  because `/gd` is now the single demo control for moving user GPS.
- Kept customer station search bound to the live `GPS hiện tại` coordinate and
  left only bike type and range controls in the customer rental filter row.
- Updated UC smoke coverage so the no-nearby-station alternative flow moves the
  customer through the GPS demo API instead of selecting a manual customer preset.
- Reordered the staff/admin rail and operations panels so menu items follow the
  actual scroll order and the active item tracks the section currently in view.
- Tightened the total-vs-late-fee chart grid so date labels sit close to their
  paired bars instead of leaving a wide empty gap on desktop.
- Raised the mobile bottom rail above open dropdown panels and capped dropdown
  menu height so the navigation/status bar remains visible while selecting.
- Constrained open mobile dropdown menus against the fixed bottom rail and moved
  mobile toast notifications above the rail so the customer status/navigation
  bar stays visible immediately after login.
- Made customer rail selection stay active when clicking `Lượt thuê` or another
  same-row panel, while keeping scroll-based active tracking for manual scrolls.
- Moved customer mobile toast notifications to the top of the viewport so login
  and action messages do not compete with the bottom command rail.
- Filtered station availability counts by selected bike type, reduced customer
  search range options to 200 m, 500 m and 1 km, removed redundant filter labels
  above the dropdowns and simplified the GPS sync chip copy.
- Aligned the selected-station bike list heading with the top of the customer
  map so the two rental columns start on the same visual baseline.
- Matched the customer bike-type filter width to the map column by sharing the
  same desktop grid tracks as the rental map/bike columns.

## 2026-06-25 - Presentation branch split and README UI gallery

- Published the `presentation` branch to keep the LaTeX/PDF report, slide deck
  and presentation assets separate from the app-focused `main` branch.
- Added tracked UI screenshots under `docs/ui/` and linked representative
  customer, operations, mobile and `/gd` screens directly from `README.md`.
- Prepared `main` to remove the heavy `pdf/` tree while keeping lightweight app
  documentation and links to the presentation branch.

## 2026-06-23 - User-level GPS and handover geofence

- Changed rental request creation so customers can send a pending pickup request
  from any demo location; the current GPS geofence is enforced at staff handover.
- Extended `/gd` with customer account search and per-user GPS positions, so the
  presenter can move a selected user even when there is no active return session.
- Streamed intermediate `/gd` route positions per selected customer and animated
  the logged-in customer map marker so both tabs follow the same user movement.
- Rebalanced the staff return table and `Xuất vé` action column so the ticket
  button no longer looks inset or clipped in dark mode.
- Rethemed empty-state blocks and toast notifications with light/dark tokens so
  push messages and empty table panels no longer appear as pale gray blocks in
  dark mode.
- Updated backend tests, UC smoke coverage, README, report and slides for the
  request-anywhere plus handover-geofence and live GPS-sync flow.

## 2026-06-23 - Staff action error visibility

- Added inline operation errors for staff handover and return-ticket actions so
  blocked pickup/return attempts show the concrete reason in the relevant panel.
- Kept the return-ticket action clickable before customer confirmation, but now
  it explains that the customer must confirm the return location within the
  station radius instead of silently disabling the button.
- Raised and repositioned toast notifications so the floating topbar no longer
  covers older push-style messages.
- Extended the UC smoke flow to cover the blocked return-ticket reason before
  continuing with the confirmed return flow.

## 2026-06-23 - Shared GPS demo position

- Added a shared `/api/gps-demo/position` endpoint so the `/gd` controller and
  customer workspace use the same demo GPS coordinate.
- Updated the customer station search to treat `GPS hiện tại` as live data from
  `/gd`, while keeping manual and last-known locations for UC alternative flows.
- Persisted snapped/dragged `/gd` positions and added a backend regression test
  proving customer station search reads the updated coordinate.

## 2026-06-23 - Floating topbar gap polish

- Restored the desktop workspace topbar as a sticky floating surface with a
  14px viewport gap, rounded border and stronger opaque background.
- Added a blurred halo behind the floating topbar so the gap between the bar and
  page edge feels soft in both light and dark mode.
- Kept the mobile bottom command rail behavior unchanged.

## 2026-06-23 - Presentation testing terminology polish

- Added a customer-mobile viewport to UI smoke evidence so slide 14 reports 5
  representative screen sizes instead of the previous 4.
- Replaced internal terms such as "staff-wide" and "geofence" in the slide deck
  with presentation-friendly Vietnamese wording.
- Rewrote the testing evidence highlight as a concrete checked demo scenario
  instead of generic "điểm nổi bật" phrasing.

## 2026-06-23 - Testing evidence slide spacing polish

- Increased spacing inside the testing evidence cards so badge, label and detail
  text no longer feel cramped.
- Updated the backend test evidence from 20/20 to the current 21/21 test suite.
- Adjusted the app-style slide header logo inset so top and right spacing read
  more evenly.

## 2026-06-23 - Customer workspace wording cleanup

- Replaced the customer hero metric label "Lượt đang theo dõi" with "Đang xử lý"
  because it counts open customer requests/rentals, not an operations monitoring
  workflow.
- Refreshed the customer desktop screenshot evidence and aligned slide/script
  wording from "theo dõi lượt thuê" to status-oriented customer language.

## 2026-06-23 - Resident discount guard hardening

- Hardened resident discount eligibility so ticket pricing and account profile
  display require a resident profile, a valid discount flag and a verified
  resident card instead of trusting stale profile flags.
- Added a migration backfill that clears resident discounts for visitor or
  unverified resident-card profiles in existing local SQLite data.
- Added a backend regression test proving visitor accounts do not receive the
  resident discount even when old data has an incorrect eligibility flag.

## 2026-06-23 - Slide app logo alignment

- Updated the app-style slide header logo to match the web `.brand-mark`:
  square green/teal gradient mark with the Lucide bicycle glyph in white.

## 2026-06-23 - Presentation CI/CD and layout cleanup

- Replaced the slide 6 data-design connector layout with a hub-and-spoke schema
  map using only straight arrows around the rental transaction core.
- Reworked the `/gd` slide into a screenshot plus four capability cards for
  session selection, road-following GPS movement, clock control and geofence
  validation.
- Replaced the PDF-build evidence card with GitHub Actions CI/CD evidence:
  static syntax check, coverage, UI smoke, UC smoke and Docker image build.
- Updated the final demo slide wording so it leads into the live app without
  presentation filler.

## 2026-06-23 - Dark-mode dropdown layering polish

- Kept the desktop topbar visible above content while rental duration dropdowns
  remain open inside bike cards, avoiding the previous z-index conflict.
- Added dark-mode bike illustration surfaces for city, tandem and child-seat
  bike cards so vehicle-type icons stay readable without light-mode panels.
- Verified the fix with a Playwright dark-mode screenshot using an open rental
  duration dropdown.

## 2026-06-23 - Presentation deck visual polish

- Replaced the text-only EBP slide header mark with the platform bicycle logo
  treatment used across the app-style deck.
- Reworked the data-design slide connectors into short orthogonal routes so fee
  policy and operations reporting no longer use awkward diagonal arrows.
- Added a dark-mode customer screenshot slide and aligned the slide script with
  the new 15-slide flow.
- Re-cropped mobile and operations screenshots with separated captions, added a
  dashboard screenshot to the reporting slide and removed the old standalone
  conclusion/Q&A ending.
- Rebuilt the testing/evidence slide as verification cards and made the final
  slide transition directly into the live demo.

## 2026-06-23 - UC-aligned auth and dark-mode UI polish

- Clarified the UC001 rule in UI/docs: CCCD/CMND must be valid and not blocked
  before rental, staff checks the document at handover, and resident-card
  pending/rejected only removes the resident discount.
- Added password reveal controls to auth/create-account/reset-password forms so
  users can verify the password they entered before submitting.
- Disabled `/gd` snap actions when the selected mode has no customer session and
  renamed the map panel to GPS user position rather than bike position.
- Removed sticky topbar behavior on desktop to avoid content scrolling under a
  floating translucent header.
- Extended dark-mode styling to Leaflet map tiles/controls, GPS chips, account
  detail rows and resident-card/account status cards.

## 2026-06-23 - Geofence rental and return confirmation

- Added station service radius support and backend geofence checks for rental
  request creation, staff handover and customer return confirmation.
- Added customer return confirmation before staff ticket issuance, with active
  rental UI showing whether the customer has confirmed the return station.
- Reworked `/gd` to control GPS user sessions from pending requests and active
  rentals instead of draggable idle bikes, while preserving map center/zoom after
  marker edits.
- Updated backend and UC smoke tests for pickup/handover/return geofence, customer
  confirmation and the revised `/gd` empty-state behavior.
- Updated README and report sections for the new geofence/confirmation scope.

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
