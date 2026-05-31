---
name: release-skill
description: Prepare Codex harness package releases with version checks, package dry-runs, npm publish readiness, release notes, verification evidence, and rollback notes. Use before publishing or tagging releases.
---

# Release Skill

## Purpose
Ensure package releases are verified, reproducible, and reversible.

## When to use
Use before npm publish, version bumps, release notes, or release automation changes.

## When NOT to use
Do not use for local-only edits that will not be packaged or released.

## Inputs required
Target version, changed files, verification output, package contents, and publish credentials status.

## Outputs required
Release checklist, package dry-run evidence, release notes, known risks, and rollback instructions.

## Required tests
Run verify, eval, package dry-run, and CLI smoke tests.

## Required fixtures
Update release fixtures or package content expectations when packaging changes.

## Required contract updates
Update public contract docs when release changes CLI or skill behavior.

## Required codebase map updates
Update current state and known problems after release preparation.

## Token saving rules
Read package metadata and release memory first; do not re-scan unchanged skill bodies.

## Acceptance criteria
Tarball contents are correct and release notes explain behavior, tests, and risks.

## Common mistakes
Publishing cache files, missing executable scripts, and omitting npm 2FA/token readiness.

## Recovery workflow
If publish fails, capture error, update known problems, do not change version until root cause is fixed.

