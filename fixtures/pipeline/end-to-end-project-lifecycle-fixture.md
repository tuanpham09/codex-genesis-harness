# End-to-End Project Lifecycle Fixture

## Initial State

- One feature is `in-progress`.
- A second feature is added as `planned`.
- Project state is `IMPLEMENTATION`.

## Lifecycle

```text
complete active feature
  -> mark active feature verified
  -> promote next planned feature
  -> keep project in IMPLEMENTATION

complete final feature
  -> mark feature verified
  -> clear active feature
  -> move project to VERIFICATION

verify project
  -> run every feature proof command
  -> run project proof command
  -> create project verification and handoff artifacts
  -> move project to RELEASE_READY

complete project
  -> require RELEASE_READY
  -> append final lifecycle event
  -> move project to COMPLETED
```

## Invariants

- Repeating a successful completion command is idempotent.
- A failed proof command blocks the transition and increments failure metrics.
- `pipeline-audit` fails on registry/state/artifact drift.
- Every accepted transition is appended to `.runs/<session-id>/EVENTS.jsonl`.
