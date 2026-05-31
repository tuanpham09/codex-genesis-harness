#!/bin/bash
# Spec Impact Engine - Core Detection Script
# Detects spec changes and calculates downstream impact

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"
PLANNING_DIR="$REPO_ROOT/.planning"
CODEBASE_DIR="$REPO_ROOT/.codebase"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Check if running in git repo
check_git_repo() {
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not a git repository"
    return 1
  fi
  return 0
}

# Get changed files since last commit
get_changed_files() {
  local changed_docs=""
  
  # Check REQUIREMENTS.md
  if git diff --name-only | grep -q "\.planning/REQUIREMENTS\.md"; then
    changed_docs="$changed_docs REQUIREMENTS.md"
  fi
  
  # Check API_DOCS.md
  if git diff --name-only | grep -q "\.planning/API_DOCS\.md"; then
    changed_docs="$changed_docs API_DOCS.md"
  fi
  
  # Check ARCHITECTURE.md
  if git diff --name-only | grep -q "\.planning/ARCHITECTURE\.md"; then
    changed_docs="$changed_docs ARCHITECTURE.md"
  fi
  
  # Check DESIGN.md
  if git diff --name-only | grep -q "\.planning/DESIGN\.md"; then
    changed_docs="$changed_docs DESIGN.md"
  fi
  
  # Check STACK.md
  if git diff --name-only | grep -q "\.planning/STACK\.md"; then
    changed_docs="$changed_docs STACK.md"
  fi
  
  # Check feature specs
  if git diff --name-only | grep -q "\.planning/features/.*/SPEC\.md"; then
    changed_docs="$changed_docs FEATURE_SPECS"
  fi
  
  # Check bug plans
  if git diff --name-only | grep -q "\.planning/bugs/.*/PLAN\.md"; then
    changed_docs="$changed_docs BUG_PLANS"
  fi
  
  echo "$changed_docs"
}

# Detect breaking changes
detect_breaking_changes() {
  local file="$1"
  local breaking_changes=""
  
  log_info "Analyzing $file for breaking changes..."
  
  # API breaking changes patterns
  if [[ "$file" == "API_DOCS.md" ]]; then
    # Check for endpoint signature changes
    if git diff "$PLANNING_DIR/API_DOCS.md" | grep -E "^\-.*GET|POST|PUT|DELETE" > /dev/null; then
      breaking_changes="endpoint_signature_changed"
      log_warning "BREAKING: Endpoint signature changed"
    fi
    
    # Check for response format changes
    if git diff "$PLANNING_DIR/API_DOCS.md" | grep -E "^\-.*\{.*\}" > /dev/null; then
      breaking_changes="$breaking_changes response_format_changed"
      log_warning "BREAKING: Response format changed"
    fi
  fi
  
  # Database breaking changes
  if [[ "$file" == "ARCHITECTURE.md" ]] || [[ "$file" == "REQUIREMENTS.md" ]]; then
    if git diff "$PLANNING_DIR/$file" | grep -E "^\-.*schema|database|model" > /dev/null; then
      breaking_changes="$breaking_changes schema_changed"
      log_warning "BREAKING: Database schema changed"
    fi
  fi
  
  echo "$breaking_changes"
}

# Identify affected phases
identify_affected_phases() {
  local change_type="$1"
  local affected_phases=""
  
  if [[ -f "$CODEBASE_DIR/PHASE_DEPENDENCY_MAP.md" ]]; then
    log_info "Reading phase dependency map..."
    # This would parse PHASE_DEPENDENCY_MAP.md to find affected phases
    # For now, scan all phase folders
    
    for phase_dir in "$PLANNING_DIR"/features/*/; do
      if [[ -f "$phase_dir/SPEC.md" ]]; then
        local phase_name=$(basename "$phase_dir")
        affected_phases="$affected_phases $phase_name"
      fi
    done
    
    log_success "Identified $(echo $affected_phases | wc -w) affected phases"
  fi
  
  echo "$affected_phases"
}

# Calculate impact severity
calculate_severity() {
  local change_type="$1"
  local severity="low"
  
  case "$change_type" in
    *endpoint_signature_changed*)
      severity="high"
      ;;
    *response_format_changed*)
      severity="high"
      ;;
    *schema_changed*)
      severity="medium"
      ;;
    *requirement_changed*)
      severity="medium"
      ;;
    *)
      severity="low"
      ;;
  esac
  
  echo "$severity"
}

# Generate impact report
generate_impact_report() {
  local changed_file="$1"
  local breaking_changes="$2"
  local affected_phases="$3"
  local severity="$4"
  
  local report_file="$CODEBASE_DIR/IMPACT_REPORT_$TIMESTAMP.md"
  
  log_info "Generating impact report: $report_file"
  
  cat > "$report_file" << EOF
# Spec Change Impact Report

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Changed File**: $changed_file
**Breaking Changes**: $breaking_changes
**Severity**: $severity

## Summary

File \`$changed_file\` was modified.

**Change Type(s)**: $breaking_changes
**Severity Level**: $severity

## Affected Phases

EOF

  local phase_count=0
  for phase in $affected_phases; do
    phase_count=$((phase_count + 1))
    echo "- $phase" >> "$report_file"
  done
  
  cat >> "$report_file" << EOF

**Total Phases Affected**: $phase_count

## Recommended Actions

1. ✅ Review breaking changes
2. → Update affected phase specs
3. → Update test contracts
4. → Run validation tests
5. → Generate migration guides
6. → Update ROADMAP.md if timeline affected

## Validation Checklist

- [ ] All affected phases reviewed
- [ ] Phase specs updated
- [ ] Tests passing
- [ ] Migration guides created
- [ ] Timeline recalculated
- [ ] Team notified

## Next Steps

Run: \`invoke spec-impact-engine /propagate-spec\`

To automatically update all affected downstream phases.

EOF

  log_success "Impact report created: $report_file"
  cat "$report_file"
}

# Main execution
main() {
  log_info "Starting spec impact analysis..."
  
  if ! check_git_repo; then
    log_error "Must be run from a git repository"
    exit 1
  fi
  
  local changed_files=$(get_changed_files)
  
  if [[ -z "$changed_files" ]]; then
    log_warning "No spec files changed"
    exit 0
  fi
  
  log_success "Detected changes: $changed_files"
  
  for file in $changed_files; do
    log_info "Processing: $file"
    
    local breaking=$(detect_breaking_changes "$file")
    if [[ -n "$breaking" ]]; then
      local affected=$(identify_affected_phases "$breaking")
      local severity=$(calculate_severity "$breaking")
      
      generate_impact_report "$file" "$breaking" "$affected" "$severity"
    fi
  done
  
  log_success "Spec impact analysis complete"
}

main "$@"
