# Harness Evolution Proposal: [Evolution Name]

---

## 🔍 Gap Analysis & Justification
- **Problem/Gap**: Describe the failure scenario, missing structural check, or CLI issue.
- **Impact**: What is the impact on developer velocity, token usage, or agent reliability?

---

## 🛠 Proposed Structural Changes
Group files by category and detail exact changes:

### [MODIFY] [verify.sh](file:///scripts/verify.sh)
- **Change**: Explain the new assertion or mapping.
- **TDD Hook**: How does it fail first?

### [NEW] [newfile.md](file:///path/to/newfile)
- **Purpose**: Explain why this file is required and what invariant it enforces.

---

## 🧪 Verification Plan

### Automated Validation
- [ ] Run `bash scripts/verify.sh`
- [ ] Run `bash scripts/run-evals.sh`
- [ ] Run `npm run pack:check`

### Line Ending Normalization
- [ ] Execute recursive CRLF -> LF Python script to ensure cross-platform safety.

---

## 💾 Resumability & Rollback Plan
- **Recovery Point**: Where will this be logged in `.codebase/RECOVERY_POINTS.md`?
- **Git Rollback command**: `git checkout -- <changed files>`
