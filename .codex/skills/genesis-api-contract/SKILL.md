---
name: api-contract-skill
description: Create and verify API contracts before endpoint implementation. Use for API routes, service interfaces, validation rules, error shapes, snapshots, and endpoint tests.
---

# API Contract Skill

## Purpose
Ensure API behavior is defined by contracts, fixtures, and tests before code.

## When to use
Use before adding or changing endpoints, request schemas, response schemas, auth, errors, or persistence behavior.

## When NOT to use
Do not use for UI-only changes that do not touch API behavior.

## Inputs required
Endpoint path, method, auth, request body, success response, error cases, and persistence effects.

## Outputs required
Contract folder, fixture, success test, validation error test, not found test, and schema validation.

## Required tests
Create contract, integration, and unit tests as appropriate.

## Required fixtures
Create API fixtures for success and failure cases.

## Required contract updates
Update `contracts/api/` with request, response, schema, example, and error JSON.

## Required codebase map updates
Update `.codebase/API_CONTRACTS.md` and `TEST_MATRIX.md`.

## Token saving rules
Load endpoint contract before source files. Open only route and validator modules named by the contract.

## Acceptance criteria
Contract tests fail before implementation and pass after the minimum endpoint change.

## Common mistakes
Implementing validation before schema, changing error shape without a contract, and testing only success.

## Recovery workflow
If endpoint behavior is ambiguous, freeze implementation and create the missing contract first.

