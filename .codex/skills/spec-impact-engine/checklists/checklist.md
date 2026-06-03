# Spec Impact Engine Checklist

Use this checklist whenever a specification change may affect downstream phases.

- [ ] Identify the changed spec files and classify each change as breaking, feature, or internal.
- [ ] Map affected downstream phases through `.codebase/PHASE_DEPENDENCY_MAP.md` when present.
- [ ] Update affected tests, contracts, fixtures, SDK/client expectations, and E2E scenarios.
- [ ] Generate or update a migration guide for breaking changes.
- [ ] Record the impact report and verification result in `.codebase/` memory.
- [ ] Run the relevant verification subset before declaring propagation complete.
