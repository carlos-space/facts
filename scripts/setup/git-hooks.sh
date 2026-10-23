#!/usr/bin/env bash
# Point git at scripts/hooks. Runs from pnpm's prepare on every install.
set -euo pipefail
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
git config core.hooksPath scripts/hooks
