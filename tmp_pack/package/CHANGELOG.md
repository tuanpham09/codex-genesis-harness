# Changelog

All notable changes to the **Project Genesis Codex Harness** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.7] - 2026-06-01

### Added
- **4 New Genesis Skills for TDD and Workflows**: Added `genesis-executing-plans`, `genesis-test-driven-development`, `genesis-verification-before-completion`, and `genesis-using-git-worktrees` to enforce strict TDD, verification, and isolation principles.

### Changed
- **Skill Consolidation**: Merged overlapping skills to resolve duplicated slash commands and clean up the architecture.
  - `genesis-docs` consolidated into `genesis-docs-automation`.
  - `genesis-mvp-planning` consolidated into `genesis-planning`.
  - `genesis-release-orchestration` consolidated into `genesis-release`.
  - `genesis-research` consolidated into `genesis-research-first`.
  - `genesis-state-machine` consolidated into `genesis-harness`.
- **Harness & Verification Improvements**: Updated tests and scripts (`verify.sh`, `run-evals.sh`, `install.sh`, `uninstall.sh`, `genesis-harness.js`) to reflect the consolidated folder structure.
- **Documentation**: Updated `README.md`, `README.EN.md`, `README.VI.md`, and `AGENTS.md` to reflect the new standardized skill set.

---

## [0.1.6] - 2026-06-01

### Added
- **`genesis-mvp-planning` Skill**: Introduced a new core planning skill designed to automatically organize a decision-complete **5-Phase MVP Roadmap** right after initialization.
  - Phase 1: Foundation & API Core
  - Phase 2: Authentication & Security
  - Phase 3: Core MVP Features
  - Phase 4: Third-Party Integrations
- **Integrated Documentation Drift Check to Validation Gates**: Automatically warns developers when code files (API handlers, database models, test files, package dependencies) are modified but matching documentation files in `.codebase` (`API_CONTRACTS.md`, `DOMAIN_MODELS.md`, `TEST_MATRIX.md`, `DEPENDENCY_GRAPH.md`) are not updated. This prevents documentation drift at the shell/Git hook level when transitioning to `COMPLETED`!
- Added standard phase templates (`templates/phase-1-core.md` through `templates/phase-5-readiness.md`), MVP readiness checklists (`checklists/mvp-readiness.md`), and complete examples (`examples/5-phase-roadmap-example.md`).
- Fully integrated `genesis-mvp-planning` into:
  - CLI harness tool (`bin/genesis-harness.js`)
  - Bash installer script (`scripts/install.sh`)
  - Bash uninstaller script (`scripts/uninstall.sh`)
  - Validation test suite (`scripts/verify.sh`)
  - Integration evals (`scripts/run-evals.sh`)
  - Primary skills list (`AGENTS.md`)
- Added missing template directories and checklists with `.gitkeep` placeholders for `genesis-observability-automation` and `genesis-research-first` skills, ensuring the test suite can execute cleanly in all environments.
- **Improved UI/UX & Vietnamese Localization for Core Skills**: Updated the display names and short descriptions in the agent configurations for the core Genesis skills to make them extremely clean, intuitive, and readable. Added elegant em-dash separators and clear Vietnamese descriptions:
  - `Genesis Harness — Lập kế hoạch, giám sát và kiểm thử dự án`
  - `Genesis New Design — Thiết kế giao diện Web hiện đại, cao cấp`
  - `Genesis Upgrade Design — Nâng cấp UI/UX của giao diện Web có sẵn`
  - `Genesis MVP Planning — Xây dựng lộ trình 5 Phase phát triển sản phẩm MVP`

### Fixed
- **Duplicate Skills Registry Bug**: Fixed a bug where backup directories created during upgrades were recursively scanned by Codex as active skills, causing duplicate slash command suggestions (e.g. 4 copies of the same command).
  - Modified the backup directory paths in `genesis-harness.js` and `install.sh` to move backups outside the scanned `skills/` path (into a parallel `backups/` folder like `~/.codex/backups` and `~/.agents/backups`).
  - Cleared old duplicate backups from the global user directories immediately.
- Fixed executable permissions (`chmod +x`) on all script utilities inside `.codex/skills/genesis-harness/scripts/` and the repository root `scripts/` folder.

### Verified
- Automated testing fully passes:
  - `npm run verify` passes structural checks for all 25 skills.
  - `npm run eval` passes clean installation and uninstallation regressions.
