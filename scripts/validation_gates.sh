#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Running canonical Genesis verification gate..."
exec node "$repo_root/bin/genesis-harness.js" verify-gate
