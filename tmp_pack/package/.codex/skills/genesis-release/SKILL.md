---
name: genesis-release
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

## MCP Automation Requirements

To ensure zero human error in releases and tags, you **MUST** use the following MCP server:
1. **`@modelcontextprotocol/server-github`**: Use this MCP tool to automatically retrieve the list of closed Pull Requests since the last release tag to draft the `CHANGELOG.md` and Release Notes. You must also use it to automatically create the Git Tag and GitHub Release via the API. Do NOT ask the user to do this manually in the browser.

---

## 🚀 Automated Release & Deployment Orchestration

This skill incorporates the **Release & Deployment Orchestration Standard** to manage production-ready releases and rollbacks using the provided templates and playbooks:

1. **Release Checklists** (`checklists/pre-release-validation.md`, `checklists/post-deployment-verification.md`)
   - Mandatory gates before staging/production merges.
   - Comprehensive post-deployment validations (health checks, API connectivity).
2. **Release Playbooks** (`playbooks/semantic-versioning-automation.md`, `playbooks/canary-deployment-orchestration.md`)
   - Executable guidelines for version bump calculations (v1.0.0 → v1.1.0) and git tags.
   - Closed-loop canary deployments (5% to 100% routing steps, metrics checks, instant triggers).
3. **Observability Tracking** (`observability/release-tracking.md`)
   - Structured release audits, recording versions, commit hashes, pipelines results, and rollout windows.
4. **Release Templates** (`templates/deployment-strategy-template.md`, `templates/release-runbook-template.md`)
   - Runbooks for critical steps and standardized strategy sheets.

### Related Release Assets
* **Checklists**: `checklists/checklist.md`, `checklists/pre-release-validation.md`, `checklists/post-deployment-verification.md`
* **Playbooks**: `playbooks/semantic-versioning-automation.md`, `playbooks/canary-deployment-orchestration.md`
* **Observability**: `observability/release-tracking.md`
* **Templates**: `templates/release-checklist-template.md`, `templates/deployment-strategy-template.md`, `templates/release-runbook-template.md`

