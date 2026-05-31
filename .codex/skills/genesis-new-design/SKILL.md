---
name: genesis-new-design
description: Create premium frontend web designs and usable first-screen experiences for new websites, web apps, dashboards, tools, and landing pages. Use when Codex is asked to design or build a new frontend UI, create a fresh page or app experience, choose a visual direction for a new product surface, or turn a product brief into implementation-ready React, Next.js, Tailwind, CSS, or HTML.
---

# Genesis New Design

Use this skill for greenfield frontend web design. Build the actual usable experience first, not a placeholder, explanation page, or generic marketing shell unless the user explicitly asks for one.

## Purpose
Create new frontend web experiences with testable UI contracts, fixtures, visual states, and verification.

## When to use
Use when building a new web page, app screen, dashboard, tool, landing page, or frontend flow.

## When NOT to use
Do not use for redesigning existing UI without first preserving behavior; use `genesis-upgrade-design` instead.

## Inputs required
Product intent, target users, primary workflow, stack details, route or entry point, state list, and visual constraints.

## Outputs required
Implemented UI, UI contract, fixtures, responsive states, visual verification, and docs or memory updates.

## Required tests
Create UI load, interaction, validation, API sync, and visual checks where practical before implementation.

## Required fixtures
Create UI fixtures for default, loading, empty, error, and success states.

## Required contract updates
Update `contracts/ui/` and API contracts for changed UI/API behavior.

## Required codebase map updates
Update `.codebase/UI_ROUTES.md`, frontend summary, and test matrix.

## Token saving rules
Read UI route maps and summaries first; inspect only relevant components, routes, and styles.

## Acceptance criteria
The UI renders correctly on desktop/mobile, supports expected states, and passes available checks.

## Common mistakes
Building a marketing page instead of the requested app, using placeholder content, and skipping error/empty states.

## Recovery workflow
If visual output fails, capture screenshot evidence, update the fixture or contract, then apply the smallest design correction.

## Workflow

1. Inspect the project stack before choosing patterns:
   - Read package/config files and existing app structure.
   - Use installed UI, icon, styling, animation, and routing libraries. Do not add dependencies unless explicitly requested.
   - Match the framework version and styling system already present.

2. Define the design intent from the request:
   - Identify audience, product category, primary task, density, tone, and constraints.
   - Choose one clear visual direction and commit to it across typography, color, spacing, surfaces, iconography, and motion.
   - For tools, dashboards, and operational apps, prioritize scanning, repeated use, compact controls, and predictable navigation over decorative hero layouts.

3. Build complete UI states:
   - Include default, loading, empty, error, hover, active, focus, disabled, and responsive states when the surface supports them.
   - Use real draft copy and plausible data. Do not use lorem ipsum, "John Doe", "Acme", or vague AI copy.
   - Use icons for common actions and tool controls. Avoid emojis in UI code, text, alt text, and labels.

4. Use visual assets intentionally:
   - Websites and branded/product pages need relevant images, screenshots, generated bitmap assets, or concrete product visuals when appropriate.
   - Do not rely on decorative blobs, generic gradients, or meaningless illustrations.
   - Keep images inspectable and useful for the user, not dark, blurred, or purely atmospheric.

5. Verify the result:
   - Run the project checks that prove the UI compiles.
   - Start the local dev server when needed.
   - Capture screenshots for visual work and inspect desktop/mobile layouts for overlap, clipping, unreadable text, blank canvases, and broken assets.

## Design Rules

- Use strong hierarchy: clear title scale, restrained supporting copy, and compact labels inside dense UI.
- Use responsive structure with stable dimensions for fixed-format controls, grids, boards, counters, and toolbars.
- Prefer CSS Grid for multi-column layouts; avoid fragile percentage math.
- Use `min-height: 100dvh` instead of `100vh` for viewport-height sections.
- Animate only `transform` and `opacity`; avoid scroll listeners for visual effects.
- Keep cards purposeful. Do not put cards inside cards or turn every page section into a floating card.
- Avoid one-note palettes and the default purple/blue AI gradient look.
- Keep border radius moderate unless the existing design system requires otherwise.
- Ensure text never overlaps adjacent content or escapes buttons, cards, sidebars, tabs, or toolbars.

## Anti-Patterns

- Do not create a landing page when the request is for an app, game, dashboard, editor, or tool.
- Do not explain the product's features in visible UI instead of building the feature.
- Do not use oversized hero typography inside compact app panels.
- Do not invent new design systems when the repo already has component conventions.
- Do not introduce new dependencies, fonts, animation libraries, or icon libraries without checking the repo and getting explicit approval.
- Do not finish without verification evidence for the code and the rendered layout.
