# AGENTS.md

This repository packages the `project-genesis-harness` Codex skill.

Primary files:

1. `.codex/skills/project-genesis-harness/SKILL.md`
2. `.codex/skills/project-genesis-harness/resources/`
3. `.codex/skills/project-genesis-harness/scripts/`
4. `scripts/install.sh`
5. `scripts/verify.sh`

When changing the skill, run:

```sh
./scripts/verify.sh
```

Keep the installer dependency-free and preserve executable bits on shell scripts.

