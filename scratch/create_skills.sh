#!/usr/bin/env bash

set -e

SKILLS=(
  "genesis-executing-plans"
  "genesis-test-driven-development"
  "genesis-verification-before-completion"
  "genesis-using-git-worktrees"
)

DESCRIPTIONS=(
  "Executing implementation plans with checklists, checkpoints, and interruption handling."
  "Enforcing RED -> GREEN -> REFACTOR workflows before implementing features or bug fixes."
  "Mandating that verification loops run successfully before claiming completion."
  "Managing isolated git worktrees when dealing with disruptive environment changes."
)

for i in "${!SKILLS[@]}"; do
  SKILL="${SKILLS[$i]}"
  DESC="${DESCRIPTIONS[$i]}"
  DIR=".codex/skills/$SKILL"
  
  mkdir -p "$DIR/agents"
  mkdir -p "$DIR/templates"
  mkdir -p "$DIR/examples"
  mkdir -p "$DIR/checklists"
  
  cat > "$DIR/SKILL.md" <<EOF
---
name: $SKILL
description: $DESC
---

# $SKILL

## Purpose
$DESC

## When to use
Use when appropriate.

## When NOT to use
Do not use otherwise.

## Inputs required
- Context files.

## Outputs required
- Completed tasks.

## Required tests
- Verify script.

## Required fixtures
- None.

## Required contract updates
- None.

## Required codebase map updates
- Update STATE.

## Token saving rules
- Be concise.

## Acceptance criteria
- Workflow passes.

## Common mistakes
- Forgetting to verify.

## Recovery workflow
- Check RECOVERY_POINTS.md.
EOF

  cat > "$DIR/agents/openai.yaml" <<EOF
name: $SKILL
default_prompt: |
  Follow the $SKILL instructions.
policy:
  allow_implicit_invocation: true
EOF

done

echo "Created 4 skills scaffolds."
