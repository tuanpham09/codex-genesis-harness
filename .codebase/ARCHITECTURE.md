# Architecture

This repository packages a Codex harness skill system. The npm package installs skills from `.codex/skills/`, command wrappers from `bin/`, and validation scripts from `scripts/`.

Core boundary: skills define agent workflows; scripts validate and install them; repository memory under `.codebase/` compresses current knowledge for future sessions.

