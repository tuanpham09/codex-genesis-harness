# Example: Sync API Contracts After Adding Payment Endpoint

## Scenario

A developer adds a new `POST /api/v2/payments` endpoint and updates the `GET /api/v2/payments/:id` response to include a `receiptUrl` field. After implementation is complete, contracts need to be synced.

## Trigger

```
invoke api-sync-skill
# Parameters:
# changed_files: ["src/api/handlers/paymentHandler.ts", "src/routes/payments.ts"]
# contract_file: ".codebase/API_CONTRACTS.md"
# breaking_changes: false
# version_bump: "minor"
```

## Step 1: Change Detection

```
Scanning changed files...

Endpoint extracted: POST /api/v2/payments
  Method: POST
  Path: /api/v2/payments
  Auth required: true
  Request body: { amount, currency, paymentMethodId }
  Response 201: { id, status, amount, currency, createdAt }
  Response 400: { error, details }
  Response 402: { error: "Payment required" }
  Status: NEW

Endpoint modified: GET /api/v2/payments/:id
  Added field: receiptUrl (optional, string)
  Breaking: NO (new optional field)
  Status: CHANGED
```

## Step 2: Contract Updated

**`.codebase/API_CONTRACTS.md`** updated:
- Added full specification for `POST /api/v2/payments`
- Updated `GET /api/v2/payments/:id` with new `receiptUrl` field
- Version bumped: `1.2.0 → 1.3.0`

## Step 3: Test Contracts Generated

```ts
// tests/contracts/payments.test.ts (auto-generated)
it('POST /api/v2/payments — creates payment', async () => {
  const res = await request.post('/api/v2/payments').send({...});
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
  expect(res.body).toHaveProperty('status');
});
```

## Outcome

```
✓ API_CONTRACTS.md updated (v1.2.0 → v1.3.0)
✓ 1 new endpoint documented
✓ 1 endpoint updated (non-breaking)
✓ Test contracts generated (3 new tests)
✓ All API tests passing (12/12)
✓ No breaking changes — no migration guide needed
→ Ready to merge
```
