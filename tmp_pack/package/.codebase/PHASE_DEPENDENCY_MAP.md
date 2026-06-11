# Phase Dependency Map

**Purpose**: Document how phases depend on each other and what each provides.

**Status**: REFERENCE - Created during `/init`, updated when phases change.

---

## Overview

This file maps the dependency relationships between all phases in the project. It enables:

- ✅ Auto-detection of impact when one phase changes
- ✅ Automatic updating of dependent phases
- ✅ Timeline recalculation when upstream phases slip
- ✅ Risk identification for parallel phases
- ✅ Automatic migration guide generation

---

## Template Structure

Every phase should document:

```yaml
phase_N:
  name: "Phase Name"
  number: N
  status: "not_started" | "in_progress" | "blocked" | "completed"
  
  # What this phase creates/provides
  provides:
    - "capability_1"
    - "capability_2"
    - "api_user_system"
    - "database_model"
  
  # Which phases depend on what this provides
  provides_to:
    - phase_N+1
    - phase_N+2
  
  # What this phase requires from other phases
  requires:
    - "api_system_from_phase_1"
    - "database_from_phase_1"
    - "auth_from_phase_2"
  
  # Which phases this depends on
  depends_on:
    - phase_1
    - phase_2
  
  # Can this phase start before dependencies complete?
  can_start_before_dependencies: false | true
  
  # Estimated duration
  estimated_days: 5
  
  # Critical path?
  on_critical_path: true | false
```

---

## Example: 5-Phase E-Commerce Platform

### Phase 1: Auth & User Management

```yaml
phase_1:
  name: "Authentication & User API"
  provides:
    - user_api
    - jwt_token_system
    - role_based_auth
    - user_model
    - admin_user_role
  
  provides_to:
    - phase_2
    - phase_3
    - phase_4
    - phase_5
  
  requires: []  # No upstream dependencies
  depends_on: []
  
  on_critical_path: true
  estimated_days: 5
```

**Why it matters**: Every other phase depends on user API.

---

### Phase 2: Product Catalog

```yaml
phase_2:
  name: "Product Catalog & Search"
  
  provides:
    - product_api
    - product_model
    - search_engine
    - category_system
  
  provides_to:
    - phase_3
    - phase_4
  
  requires:
    - user_api_from_phase_1
    - admin_role_from_phase_1
  
  depends_on:
    - phase_1
  
  on_critical_path: true
  estimated_days: 7
```

**Why it matters**: Shopping Cart (Phase 3) needs products.

---

### Phase 3: Shopping Cart & Orders

```yaml
phase_3:
  name: "Shopping Cart & Order Management"
  
  provides:
    - cart_api
    - order_model
    - order_api
    - inventory_tracking
  
  provides_to:
    - phase_4
    - phase_5
  
  requires:
    - user_api_from_phase_1
    - product_api_from_phase_2
    - jwt_auth_from_phase_1
  
  depends_on:
    - phase_1
    - phase_2
  
  on_critical_path: true
  estimated_days: 6
  
  # Can start when Phase 2 endpoints exist
  can_start_before_dependencies: true
```

**Why it matters**: 
- Blocks payment system (Phase 4)
- Orders need products
- Orders need user authentication

---

### Phase 4: Payment Processing

```yaml
phase_4:
  name: "Payment Processing & Transactions"
  
  provides:
    - payment_api
    - stripe_integration
    - payment_model
    - transaction_history
  
  provides_to:
    - phase_5
  
  requires:
    - order_api_from_phase_3
    - user_api_from_phase_1
    - jwt_auth_from_phase_1
  
  depends_on:
    - phase_1
    - phase_3
  
  on_critical_path: true
  estimated_days: 4
```

**Why it matters**: Must complete before Phase 5 (Admin Dashboard).

---

### Phase 5: Admin Dashboard

```yaml
phase_5:
  name: "Admin Dashboard & Analytics"
  
  provides:
    - admin_dashboard
    - analytics_api
    - reporting_engine
  
  provides_to: []  # Final phase
  
  requires:
    - user_api_from_phase_1
    - product_api_from_phase_2
    - order_api_from_phase_3
    - payment_api_from_phase_4
  
  depends_on:
    - phase_1
    - phase_2
    - phase_3
    - phase_4
  
  on_critical_path: true
  estimated_days: 5
```

**Why it matters**: 
- Requires all other phases complete
- Can't start until Phase 4 done
- Needs data from all systems

---

## Breaking Change Rules

**When to trigger downstream updates:**

```yaml
breaking_changes:
  
  - trigger: "API endpoint signature changed"
    severity: "HIGH"
    affects_phases: "all_dependent"
    action: "auto_update_tests_and_specs"
    
    example: |
      Phase 1: GET /api/users/:id
        Before: { name, email, role }
        After:  { id, name, email, roles[] }
      
      Impact: Phase 2, 3, 4, 5 all affected
      Action: Auto-update 20+ tests, 5 specs
  
  - trigger: "Database schema changed"
    severity: "MEDIUM"
    affects_phases: "phases_using_schema"
    action: "generate_migration_scripts"
    
    example: |
      Phase 2: User table loses 'role' field
      Phase 3: Must update queries
      Impact: Rewrite 3 queries
  
  - trigger: "Auth method changed"
    severity: "HIGH"
    affects_phases: "all"
    action: "auto_update_all_phases"
    
    example: |
      Phase 1: JWT → OAuth2
      Impact: All phases use auth
      Action: Update 50+ files
  
  - trigger: "Database model changed"
    severity: "MEDIUM"
    affects_phases: "downstream"
    action: "generate_schema_migration"
    
    example: |
      Phase 2 adds Product.category_id
      Phase 3 queries now need category
      Action: Update Phase 3 SPEC.md + tests
```

---

## Parallel Work Opportunities

```
Phases that CAN run in parallel:

├─ Phase 1: Auth & Users
│  ├─ Phase 2: Products (can start when Phase 1 API exists)
│  └─ Phase 2: Products
│     ├─ Phase 3: Cart (can start when Phase 2 API exists)
│     ├─ Phase 4: Payments (blocks on Phase 3)
│     └─ Phase 5: Admin (blocks on all)
│
└─ Timeline:
   Phase 1: ████████ (days 1-5)
   Phase 2:     ████████████ (days 4-10, starts early)
   Phase 3:          ██████████ (days 7-12, starts early)
   Phase 4:               ████████ (days 10-13, blocks on Phase 3)
   Phase 5:                    ██████████ (days 13-18)
```

**Parallel work**: Phases 1-2 and 1-3 can overlap, saving time.

---

## Timeline Impact Matrix

When a phase slips, what's the impact?

```
Phase 1 slips 2 days:
  → Phase 2 starts 2 days late (depends on Phase 1 API)
  → Phase 3 starts 2+ days late (depends on Phase 2)
  → Phase 4 starts 2+ days late (depends on Phase 3)
  → Phase 5 starts 2+ days late (depends on Phase 4)
  → TOTAL PROJECT DELAY: 2 days minimum

Phase 3 slips 3 days:
  → Phase 4 starts 3 days late (BLOCKS on Phase 3)
  → Phase 5 starts 3+ days late (depends on Phase 4)
  → TOTAL PROJECT DELAY: 3+ days
  → CRITICAL PATH: Phase 3 is on it

Phase 2 slips 2 days (but Phase 1 not affected):
  → Phase 3 starts 2 days late? 
  → ONLY IF Phase 2 completion blocking Phase 3
  → Check: can_start_before_dependencies: true
```

---

## Auto-Update Triggering Rules

When to automatically update downstream phases:

```javascript
if (phase_X_spec_changed) {
  
  // Find all phases that depend on phase_X
  const affected_phases = find_phases_with_requires("from_phase_X");
  
  // For each affected phase
  for (const phase of affected_phases) {
    
    // Calculate severity
    const severity = calculate_severity(change_type);
    
    // Auto-update if HIGH severity
    if (severity === "high") {
      auto_update_specs(phase);
      auto_update_tests(phase);
      run_validation(phase);
      notify_developer(phase);
    }
    
    // Flag for review if MEDIUM severity
    if (severity === "medium") {
      flag_for_manual_review(phase);
      notify_developer(phase, "review_needed");
    }
    
    // Log if LOW severity
    if (severity === "low") {
      log_suggestion(phase);
    }
  }
}
```

---

## Usage in Workflows

### During `/new-feature` completion:

```
Feature Phase X completed
  ↓
If Phase X provides capabilities:
  ↓
Check: which phases depend on Phase X?
  ↓
If specs changed (breaking change):
  ↓
Auto-update all dependent phase specs/tests
  ↓
Run validation on dependent phases
  ↓
Notify team if timeline affected
```

### During `/api-sync`:

```
API endpoint changed in Phase X
  ↓
Detect: this is a breaking change
  ↓
Query: which phases call this endpoint?
  ↓
Auto-update all dependent phases:
  - SPEC.md (update API calls)
  - TEST_CONTRACT.md (update assertions)
  - PLAN.md (update implementation notes)
  ↓
Generate migration guide
  ↓
Run tests in affected phases
  ↓
Create PR with all updates
```

### Timeline Recalculation:

```
Phase 1 completes 3 days late
  ↓
PHASE_DEPENDENCY_MAP identifies:
  - Phase 2 depends on Phase 1
  - Phase 3 depends on Phase 2
  - Phase 4 depends on Phase 3
  - Phase 5 depends on Phase 4
  ↓
Auto-update ROADMAP.md:
  - Phase 2 new end date: +3 days
  - Phase 3 new end date: +3 days
  - Phase 4 new end date: +3 days
  - Phase 5 new end date: +3 days
  ↓
ROADMAP updated, team notified
```

---

## Creating Your Dependency Map

During `/init`, the system asks:

```
1. How many phases do you have?
2. What does each phase produce?
3. What does each phase require?
4. Which phases can run in parallel?
5. What are the timeline risks?
```

Answer these → Auto-generate PHASE_DEPENDENCY_MAP.md

---

## Validation Checks

Genesis Harness validates:

```
✓ No circular dependencies (Phase 1 → 2 → 3 → 1)
✓ All provides are listed in provides_to
✓ All requires exist in upstream phases
✓ depends_on is subset of phases with matching provides
✓ on_critical_path is consistent
✓ No unreachable phases
```

If validation fails → Display errors → Block `/init`

---

## Next Steps

1. **Create for your project** during `/init`
2. **Update when phases change** during planning
3. **Used automatically** by spec-impact-engine
4. **Enables safe refactoring** across phases
5. **Prevents cascading rework** via auto-updates

---

**Last Updated**: 2026-05-30  
**Version**: 1.0  
**Used by**: spec-impact-engine, Genesis Harness `/new-feature` and `/api-sync`
