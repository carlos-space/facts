#!/usr/bin/env bash
# Assembled-system check: pack each package that release-please-config.json lists, install the tarballs
# into an empty directory and run a smoke test against what was installed, not against the sources. Unit
# tests prove the sources; this proves the published shape (files whitelist, exports, bin) still works.
# On a release branch the config lists only the train's packages, so this checks what the train ships.
# Run after `pnpm build`; ci.yml runs it on push to release/**.
# usage: assembled-check.sh
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"
work="$root/tmp/assembled"
rm -rf "$work"; mkdir -p "$work/packed" "$work/app"

mapfile -t paths < <(jq -r '.packages | keys[]' release-please-config.json)
for p in "${paths[@]}"; do (cd "$p" && pnpm pack --pack-destination "$work/packed" >/dev/null); done
printf '%s\n' "packed: $(find "$work/packed" -name '*.tgz' -exec basename {} \; | paste -sd' ' -)"

cd "$work/app"
printf '%s\n' '{"name":"assembled-check","private":true,"type":"module"}' > package.json
npm install --no-audit --no-fund --silent "$work"/packed/*.tgz

for p in "${paths[@]}"; do
  case "$p" in
    packages/platform-facts)
      node --input-type=module -e "
        import { readFileSync } from 'node:fs'
        import { createRequire } from 'node:module'
        const exportsMap = JSON.parse(readFileSync('node_modules/platform-facts/package.json', 'utf8')).exports
        const require = createRequire(import.meta.url)
        for (const subpath of Object.keys(exportsMap)) {
          const index = JSON.parse(readFileSync(require.resolve('platform-facts/' + subpath.slice(2)), 'utf8'))
          if (!index || typeof index !== 'object') throw new Error(subpath + ' is not a JSON object')
        }
        console.log('platform-facts: ' + Object.keys(exportsMap).length + ' index files readable')" ;;
    *) printf '%s\n' "no smoke test for $p" >&2; exit 1 ;;
  esac
  printf '%s\n' "✓ $p"
done
