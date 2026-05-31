---
name: design-spec-skill
description: Define UI design specs, route contracts, visual states, accessibility expectations, and UI/API synchronization before frontend implementation. Use for new screens, redesigns, visual QA, or UI contract updates.
---

# Design Spec Skill

## Purpose
Make UI behavior and visual expectations contract-first before implementation.

## When to use
Use before creating or changing screens, dashboards, forms, flows, or visual states.

## When NOT to use
Do not use for backend-only changes with no UI effect.

## Inputs required
UI route, audience, state list, API dependencies, fixtures, and visual references if available.

## Outputs required
UI contract, Playwright fixture, acceptance states, and visual regression expectations.

## Required tests
Create load, interaction, validation, API sync, and visual regression tests where applicable.

## Required fixtures
Create UI fixtures for default, loading, empty, error, and success states.

## Required contract updates
Update `contracts/ui/` for changed routes or states.

## Required codebase map updates
Update `.codebase/UI_ROUTES.md` and frontend summary.

## Token saving rules
Use state tables and route maps instead of long visual prose.

## Acceptance criteria
The UI can be implemented and tested without guessing states or API behavior.

## Common mistakes
Designing only the happy path, skipping empty/error states, and omitting API synchronization.

## Recovery workflow
If implementation diverges from spec, update the failing UI test first, then repair contract or UI.

