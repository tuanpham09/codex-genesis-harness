---
name: genesis-upgrade-design
description: Upgrade existing frontend web UI quality without changing behavior. Use when Codex is asked to redesign, polish, modernize, improve UX, make an app look premium, clean up AI-looking UI, improve responsive layout, audit visual quality, or apply targeted design upgrades to existing React, Next.js, Tailwind, CSS, HTML, dashboard, app, or website code.
---

# Genesis Upgrade Design

Use this skill for existing frontend projects. Improve what is there; do not rewrite the product or change behavior unless the user explicitly asks.

## Workflow

1. Audit before editing:
   - Inspect routes, components, styling system, theme tokens, assets, and package dependencies.
   - Identify the primary user workflows and the UI surfaces that matter most.
   - Capture or run the current UI when feasible so changes can be compared.

2. Preserve behavior:
   - Keep routing, data flow, public APIs, form semantics, state contracts, accessibility semantics, and test expectations intact.
   - Reuse existing components, utilities, variables, icons, and layout primitives.
   - Avoid broad rewrites. Make targeted changes that raise quality with the smallest safe diff.

3. Upgrade visual quality:
   - Improve typography scale, line height, copy rhythm, alignment, and scanability.
   - Normalize spacing, containers, grid tracks, button sizing, toolbar density, and responsive breakpoints.
   - Replace generic AI patterns: centered sameness, card spam, purple/blue glow defaults, placeholder content, weak empty states, and decorative clutter.
   - Add or improve loading, empty, error, hover, active, focus, and disabled states where the existing UI lacks them.
   - Use images or product visuals only when they clarify the product or user task.

4. Harden responsive and interaction details:
   - Check mobile and desktop viewports for overflow, clipping, overlap, unreadable text, and layout jumps.
   - Use stable dimensions for repeated controls and fixed-format UI.
   - Animate only `transform` and `opacity`; avoid effects that trigger layout or continuous repainting.
   - Keep keyboard focus visible and preserve accessible labels.

5. Verify and compare:
   - Run lint/typecheck/tests/build that are available for the project.
   - Start the dev server when visual validation requires it.
   - Capture screenshots after changes and inspect important states and viewports.
   - If reference screenshots or a target design are provided, compare against them before claiming completion.

## Upgrade Heuristics

- Operational tools should feel quiet, dense, and work-focused.
- Marketing and brand pages should make the product, place, offer, or brand obvious in the first viewport.
- Dashboards should prioritize scanability, tabular alignment, filters, state visibility, and repeated action speed.
- Forms should use labels above inputs, helper/error text below inputs, visible focus, and inline validation.
- Navigation should clearly show current location and avoid dead links.
- Copy should be specific and plain. Avoid "Elevate", "Seamless", "Unleash", "Next-Gen", "Game-changer", "Delve", and "In the world of...".

## Completion Bar

Do not call the upgrade complete until:

- Existing behavior is preserved.
- The changed UI renders correctly at desktop and mobile sizes.
- Core interactions have hover/active/focus states.
- No text overlap, clipped controls, broken assets, or blank primary surfaces remain.
- Verification commands have passed, or any skipped checks are reported with the reason.
