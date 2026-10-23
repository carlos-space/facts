#!/usr/bin/env bash
# Publish packages to their registry. publish.yml calls it with the package paths a release created.
# usage: publish-units.sh <package path>...      e.g. packages/fact-kit
#   PUBLISH_OUT      where tarballs are packed (default tmp/publish)
#   PUBLISH_DRY_RUN  1 passes --dry-run to npm publish
#   NODE_AUTH_TOKEN  token for a non-npmjs registry (GitHub Packages)
#
# The registry is publishConfig.registry of the package (npmjs.org when absent). npmjs.org uses npm
# Trusted Publishing (OIDC, npm >= 11.5.1) and needs no token. pnpm packs and the npm CLI publishes the
# tarball. The tarball is scanned before it is published. A version already in the registry is skipped,
# so a re-run is safe. package.json must carry the version in .release-please-manifest.json.
set -euo pipefail
root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"
die() { echo "::error::$*" >&2; exit 1; }
summary() { [[ -z "${GITHUB_STEP_SUMMARY:-}" ]] || printf '%s\n' "- $*" >> "$GITHUB_STEP_SUMMARY"; }

publish_one() { # publish_one <package path>
  local p="$1" name ver want reg tgz out
  local -a dry=()
  [[ -f "$p/package.json" ]] || die "$p/package.json not found"
  name="$(jq -r .name "$p/package.json")"
  ver="$(jq -r .version "$p/package.json")"
  want="$(jq -r --arg p "$p" '.[$p] // empty' .release-please-manifest.json)"
  [[ -n "$want" ]] || die "$p is not in .release-please-manifest.json"
  [[ "$ver" == "$want" ]] || die "$p: manifest says $want but package.json says $ver"
  reg="$(jq -r '.publishConfig.registry // "https://registry.npmjs.org"' "$p/package.json")"

  local -a access=(--access public)
  if [[ "$reg" != "https://registry.npmjs.org" ]]; then
    [[ -n "${NODE_AUTH_TOKEN:-}" ]] || die "NODE_AUTH_TOKEN is required for $reg"
    # an npmrc of our own, so the token never lands in a file inside the repository
    mkdir -p "$PUBLISH_OUT"
    export NPM_CONFIG_USERCONFIG="$PUBLISH_OUT/.npmrc"
    printf '%s\n' "//${reg#https://}/:_authToken=${NODE_AUTH_TOKEN}" > "$NPM_CONFIG_USERCONFIG"
    access=()
  fi

  if npm view "$name@$ver" version --registry "$reg" 2>/dev/null | grep -qx "$ver"; then
    echo "$name@$ver is already on $reg, skipping"; summary "\`$name@$ver\` already on $reg, skipped"; return 0
  fi

  out="$PUBLISH_OUT/$(basename "$p")"
  rm -rf "$out"; mkdir -p "$out/unpacked"
  (cd "$p" && pnpm pack --pack-destination "$out" >/dev/null)
  tgz="$(find "$out" -maxdepth 1 -name '*.tgz' | head -1)"
  [[ -n "$tgz" ]] || die "no tarball after packing $p"
  tar -xzf "$tgz" -C "$out/unpacked"
  bash scripts/release/scan-tarball.sh "$out/unpacked" "$p" || die "$name tarball failed the content scan; nothing was published"

  [[ "${PUBLISH_DRY_RUN:-0}" == 1 ]] && dry=(--dry-run)
  echo "publishing $name@$ver to $reg ${dry[*]:-}"
  npm publish "$tgz" ${access[@]+"${access[@]}"} --registry "$reg" ${dry[@]+"${dry[@]}"}
  summary "published \`$name@$ver\` to $reg ${dry[*]:-}"
}

[[ $# -ge 1 ]] || die "usage: publish-units.sh <package path>..."
PUBLISH_OUT="${PUBLISH_OUT:-$root/tmp/publish}"
for u in "$@"; do
  u="${u%/}"
  [[ "$u" =~ ^packages/[a-z0-9-]+$ ]] || die "unexpected package path: $u"
  publish_one "$u"
done
