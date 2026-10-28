#!/usr/bin/env bash
# Scan an unpacked npm tarball for what must not ship: local absolute paths in any text file, and, for
# every index.json inside, the same rules `fact-kit check` applies (local paths, unregistered domains).
# The patterns mirror the check command of the fact-kit package. The allowed domains come from the package's
# fact-kit.config.json, which does not ship; its other settings are paths in the source tree, so only
# allowedDomains is passed on. An aggregate package ("aggregate" in its config) has no domains of its own:
# they are the union of the allowedDomains of its component packages. Each component is found through
# $pkg/node_modules/<component package>, the workspace link that its devDependencies entry creates (the same
# way `fact-kit build` finds it), so this needs `pnpm install` and no knowledge of where components live.
# usage: scan-tarball.sh <unpacked tarball dir> <package source dir>      exit 1 on any finding
set -euo pipefail
dir="${1:?usage: scan-tarball.sh <dir> <package dir>}"
pkg="${2:?usage: scan-tarball.sh <dir> <package dir>}"
root="$(cd "$(dirname "$0")/../.." && pwd)"
bad=0

allow=()
if [[ -f "$pkg/fact-kit.config.json" ]]; then
  while IFS= read -r d; do allow+=(--allow-domain "$d"); done < <(
    node -e '
      const fs = require("fs"), path = require("path")
      const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"))
      const pkg = process.argv[1]
      const config = read(path.join(pkg, "fact-kit.config.json"))
      const domains = new Set(config.allowedDomains ?? [])
      for (const name of Object.values(config.aggregate ?? {})) {
        const file = path.join(pkg, "node_modules", name, "fact-kit.config.json")
        if (!fs.existsSync(file)) { console.error("component " + name + " not found under " + pkg + "/node_modules"); process.exit(1) }
        for (const d of read(file).allowedDomains ?? []) domains.add(d)
      }
      for (const d of [...domains].sort()) console.log(d)' \
      "$pkg"
  )
fi

# POSIX/macOS home paths, Windows drive paths, file:// URLs
re='(^|[^[:alnum:]_.~:/-])/(Users|home|root)/[^[:space:]"'"'"'`<>)]+|[A-Za-z]:[\\/](Users|Windows|Program Files)[\\/][^[:space:]]|file:///[^[:space:]]'
if grep -rEnI "$re" "$dir"; then
  echo "::error::local absolute path found in the tarball (lines above)"; bad=1
fi

while IFS= read -r idx; do
  "$pkg/node_modules/.bin/fact-kit" check --cwd "$(mktemp -d)" --index "$idx" ${allow[@]+"${allow[@]}"} || bad=1
done < <(find "$dir" -name index.json -not -path '*/node_modules/*')

exit "$bad"
