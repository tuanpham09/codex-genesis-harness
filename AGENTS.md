# AGENTS.md

This repository packages the Genesis Codex skill set.

Primary files:

1. `.codex/skills/genesis-harness/SKILL.md`
2. `.codex/skills/genesis-harness/resources/`
3. `.codex/skills/genesis-harness/scripts/`
4. `.codex/skills/genesis-new-design/SKILL.md`
5. `.codex/skills/genesis-upgrade-design/SKILL.md`
6. `scripts/install.sh`
7. `scripts/verify.sh`

When changing the skill, run:

```sh
./scripts/verify.sh
```

Keep the installer dependency-free and preserve executable bits on shell scripts.

