#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
cd "$root"

say() { printf '%s\n' "$*"; }
has() { [ -e "$1" ]; }

say "# Detected Stack Clues"

has package.json && say "- JavaScript/TypeScript: package.json"
has pnpm-lock.yaml && say "- Package manager: pnpm"
has yarn.lock && say "- Package manager: yarn"
has package-lock.json && say "- Package manager: npm"
has pyproject.toml && say "- Python: pyproject.toml"
has requirements.txt && say "- Python dependencies: requirements.txt"
has Cargo.toml && say "- Rust: Cargo.toml"
has go.mod && say "- Go: go.mod"
has composer.json && say "- PHP: composer.json"
find . -maxdepth 3 \( -name '*.csproj' -o -name '*.sln' \) -print | sed 's#^\./#- .NET: #' || true
has Dockerfile && say "- Container: Dockerfile"
has docker-compose.yml && say "- Compose: docker-compose.yml"
has compose.yml && say "- Compose: compose.yml"
find . -maxdepth 3 -type d \( -name src -o -name app -o -name tests -o -name test -o -name docs \) -print | sed 's#^\./#- Directory: #' || true

