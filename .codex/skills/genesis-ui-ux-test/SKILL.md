---
name: ui-ux-test-skill
description: Create UI smoke, e2e, interaction, validation, API synchronization, and visual regression tests before frontend changes. Use for screens, flows, forms, dashboards, and UI regressions.
---

# UI UX Test Skill

## Purpose
Make UI quality measurable through Playwright and fixture-backed tests.

## When to use
Use before implementing or upgrading UI routes, states, interactions, or visual behavior.

## When NOT to use
Do not use for non-UI changes.

## Inputs required
Route, role, viewport, API fixture, user actions, expected UI states, and visual references.

## Outputs required
Playwright test plan, fixtures, visual regression expectations, and API sync assertions.

## Required tests
Load, interaction, validation, API synchronization, and visual regression tests.

## Required fixtures
Create route fixtures under `playwright/fixtures/`.

## Required contract updates
Update `contracts/ui/` for every changed screen state.

## Required codebase map updates
Update `.codebase/UI_ROUTES.md` and `TEST_MATRIX.md`.

## Token saving rules
Read UI route map and fixture first; inspect only the route and components under test.

## Acceptance criteria
The UI has automated coverage for key workflows and visual states.

## Common mistakes
Testing only page load, skipping mobile, and ignoring API synchronization.

## Recovery workflow
If visual tests are flaky, stabilize fixtures and selectors before changing assertions.

