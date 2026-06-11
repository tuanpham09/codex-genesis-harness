#!/usr/bin/env bash

# detect-changes.sh
# Auto-detect file changes and identify what .codebase docs need updating
# Run after implementation to identify sync needs

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CODEBASE_DIR="$PROJECT_ROOT/.codebase"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Auto-Detect Changes ===${NC}"
echo ""

# Track what needs updating
UPDATES_NEEDED=()

# 1. Check for new/modified API files
echo -e "${YELLOW}Scanning API changes...${NC}"
api_files=$(find "$PROJECT_ROOT/src" -name "*api*" -o -name "*endpoint*" -o -name "*route*" 2>/dev/null || true)
if [ ! -z "$api_files" ]; then
  echo "  ✓ API files detected"
  UPDATES_NEEDED+=("API_CONTRACTS.md")
fi

# 2. Check for database/model changes
echo -e "${YELLOW}Scanning database changes...${NC}"
if find "$PROJECT_ROOT" -type f \( -name "*model*" -o -name "*schema*" -o -name "*db*" \) 2>/dev/null | grep -q .; then
  echo "  ✓ Database/model files detected"
  UPDATES_NEEDED+=("DOMAIN_MODELS.md")
fi

# 3. Check for route/UI changes
echo -e "${YELLOW}Scanning UI route changes...${NC}"
if find "$PROJECT_ROOT" -type f \( -name "*route*" -o -name "*page*" \) -path "*/src/pages/*" 2>/dev/null | grep -q .; then
  echo "  ✓ UI route files detected"
  UPDATES_NEEDED+=("UI_ROUTES.md")
fi

# 4. Check for test changes
echo -e "${YELLOW}Scanning test changes...${NC}"
test_count=$(find "$PROJECT_ROOT/tests" -name "*.test.*" 2>/dev/null | wc -l)
if [ "$test_count" -gt 0 ]; then
  echo "  ✓ $test_count test files found"
  UPDATES_NEEDED+=("TEST_MATRIX.md")
fi

# 5. Check for module changes
echo -e "${YELLOW}Scanning module exports...${NC}"
if find "$PROJECT_ROOT/src" -name "index.*" 2>/dev/null | grep -q .; then
  echo "  ✓ Module index files detected"
  UPDATES_NEEDED+=("MODULE_INDEX.md")
fi

# 6. Check for dependency changes
echo -e "${YELLOW}Scanning dependency changes...${NC}"
if [ -f "$PROJECT_ROOT/package.json" ]; then
  echo "  ✓ package.json found"
  UPDATES_NEEDED+=("DEPENDENCY_GRAPH.md")
fi

# 7. Check for architecture changes
echo -e "${YELLOW}Scanning architecture changes...${NC}"
if find "$PROJECT_ROOT" -name "*.md" -exec grep -l "architecture\|diagram\|flow" {} \; 2>/dev/null | grep -q .; then
  echo "  ✓ Architecture documentation found"
  UPDATES_NEEDED+=("ARCHITECTURE.md")
fi

# 8. Always update CURRENT_STATE after any implementation
UPDATES_NEEDED+=("CURRENT_STATE.md")

# Remove duplicates
UPDATES_NEEDED=($(printf '%s\n' "${UPDATES_NEEDED[@]}" | sort -u))

echo ""
echo -e "${GREEN}Files that need updating:${NC}"
for file in "${UPDATES_NEEDED[@]}"; do
  echo "  → $CODEBASE_DIR/$file"
done

echo ""
echo -e "${BLUE}=== Update Summary ===${NC}"
echo "Run these commands to sync documentation:"
echo ""

for file in "${UPDATES_NEEDED[@]}"; do
  case $file in
    "API_CONTRACTS.md")
      echo -e "${YELLOW}1. API_CONTRACTS.md${NC}"
      echo "   Check: src/**/api.ts, src/**/endpoint.ts"
      echo "   Run: extract-api-contracts.sh"
      echo ""
      ;;
    "DOMAIN_MODELS.md")
      echo -e "${YELLOW}2. DOMAIN_MODELS.md${NC}"
      echo "   Check: src/**/models, src/**/schema"
      echo "   Run: extract-domain-models.sh"
      echo ""
      ;;
    "UI_ROUTES.md")
      echo -e "${YELLOW}3. UI_ROUTES.md${NC}"
      echo "   Check: src/pages/**, src/**/route.ts"
      echo "   Run: extract-routes.sh"
      echo ""
      ;;
    "TEST_MATRIX.md")
      echo -e "${YELLOW}4. TEST_MATRIX.md${NC}"
      echo "   Check: tests/** coverage"
      echo "   Run: npm test -- --coverage && update-test-matrix.sh"
      echo ""
      ;;
    "MODULE_INDEX.md")
      echo -e "${YELLOW}5. MODULE_INDEX.md${NC}"
      echo "   Check: src/**/index.ts exports"
      echo "   Run: extract-modules.sh"
      echo ""
      ;;
    "DEPENDENCY_GRAPH.md")
      echo -e "${YELLOW}6. DEPENDENCY_GRAPH.md${NC}"
      echo "   Check: package.json dependencies"
      echo "   Run: extract-dependencies.sh"
      echo ""
      ;;
    "ARCHITECTURE.md")
      echo -e "${YELLOW}7. ARCHITECTURE.md${NC}"
      echo "   Check: System design and data flows"
      echo "   Run: Review and update manually"
      echo ""
      ;;
    "CURRENT_STATE.md")
      echo -e "${YELLOW}8. CURRENT_STATE.md${NC}"
      echo "   Always update after changes"
      echo "   Run: update-state.sh"
      echo ""
      ;;
  esac
done

echo -e "${BLUE}Next steps:${NC}"
echo "1. Update each file using the commands above"
echo "2. Run: ./scripts/verify.sh"
echo "3. Commit changes with descriptive message"
echo "4. Create PR with documentation sync"
echo ""
