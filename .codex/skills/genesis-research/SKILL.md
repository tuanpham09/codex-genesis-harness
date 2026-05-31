---
name: research-skill
description: Run local and external research for Codex harness decisions with source attribution, repository evidence, assumptions, and reusable research notes. Use before adopting APIs, SDKs, architecture patterns, or uncertain implementation approaches.
---

# Research Skill

## Purpose
Ground decisions in repository evidence and current authoritative sources.

## When to use
Use when facts may be stale, external APIs are involved, or implementation direction is uncertain.

## When NOT to use
Do not use when local code already answers the question and no external fact is needed.

## Inputs required
Research question, decision needed, local files, external source constraints, and acceptance criteria.

## Outputs required
Research note with local evidence, external citations, recommendation, rejected options, and follow-up tests.

## Required tests
Translate research into failing tests or contract checks before implementation.

## Required fixtures
Create fixtures for researched API examples or edge cases.

## Required contract updates
Update contracts if research changes public behavior or schemas.

## Required codebase map updates
Update memory files with durable conclusions and source dates.

## Token saving rules
Search targeted files first; summarize sources and avoid pasting long excerpts.

## Acceptance criteria
Decision is supported by evidence and converted into testable work.

## Common mistakes
Researching broadly without a decision, trusting stale docs, and failing to encode findings in tests.

## Recovery workflow
If research conflicts, prefer primary sources, document uncertainty, and choose the smallest reversible test.

