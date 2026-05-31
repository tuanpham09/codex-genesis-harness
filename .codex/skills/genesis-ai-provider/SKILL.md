---
name: ai-provider-skill
description: Define reliable AI provider harnesses with mock providers, schemas, retries, invalid JSON recovery, persistence tests, and provider contracts. Use for LLM, image, voice, subtitle, render, and pipeline provider work.
---

# AI Provider Skill

## Purpose
Make AI provider behavior deterministic under tests and recoverable under failures.

## When to use
Use before adding or changing AI providers, provider adapters, retry logic, schema parsing, or persistence.

## When NOT to use
Do not use for purely static documentation changes.

## Inputs required
Provider name, request shape, expected response, error modes, retry policy, and persistence target.

## Outputs required
Provider contract, mock provider fixture, schema validation, retry test, invalid JSON recovery test, and persistence test.

## Required tests
Mock success, provider error, retry, invalid JSON recovery, and persistence tests.

## Required fixtures
Create provider fixtures under `fixtures/agents`, `fixtures/images`, `fixtures/tts`, or related directories.

## Required contract updates
Update `contracts/agents/` or provider-specific contracts.

## Required codebase map updates
Update providers summary, pipeline flow, and test matrix.

## Token saving rules
Read provider summary and contract before provider code.

## Acceptance criteria
Provider output is schema-validated and failure recovery is tested.

## Common mistakes
Trusting raw model JSON, skipping retry tests, and using live provider calls in normal tests.

## Recovery workflow
If provider output is invalid, capture fixture, add parser recovery test, then patch parser or contract.

