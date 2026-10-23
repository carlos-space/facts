#!/usr/bin/env bash
# Shared helpers for release / scenario scripts. Source it; do not execute.
#   DRY_RUN=1     print every mutating command instead of running it
#   ASSUME_YES=1  skip the interactive confirmation for external writes (CI / scenario --yes)
#   TASK_DIR      where external-ops.log lives (default tmp/<today>-release-ops)
# A script that skipped any external write (declined, or no terminal to answer the prompt) lists the
# skipped writes and exits 3 even when everything else succeeded, outside DRY_RUN.
set -euo pipefail

# mapfile and associative arrays are bash 4; macOS still ships 3.2 as /bin/bash, so say so plainly
# rather than failing later with a confusing parse error.
if (( BASH_VERSINFO[0] < 4 )); then
  printf '%s\n' "✗ 需要 bash 4 以上（目前 ${BASH_VERSION}）；macOS 內建的 /bin/bash 是 3.2，請以 brew install bash 安裝後再跑" >&2
  exit 1
fi

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel)}"
DRY_RUN="${DRY_RUN:-0}"
ASSUME_YES="${ASSUME_YES:-0}"
TASK_DIR="${TASK_DIR:-$REPO_ROOT/tmp/$(date +%Y-%m-%d)-release-ops}"
AUDIT_LOG="$TASK_DIR/external-ops.log"
CONFIG="release-please-config.json"
MANIFEST=".release-please-manifest.json"

log()  { printf '%s\n' "→ $*"; }
info() { printf '%s\n' "  $*"; }
warn() { printf '%s\n' "! $*" >&2; }
die()  { printf '%s\n' "✗ $*" >&2; exit 1; }

# bash has no array-membership operator, and open-coding the loop at each call site is where
# unquoted-expansion bugs creep in, so every membership test goes through this one helper.
in_array() { # in_array <needle> <haystack>...
  local needle="$1"; shift
  local item
  for item in "$@"; do [[ "$item" == "$needle" ]] && return 0; done
  return 1
}

# run a local (reversible) command; printed only under DRY_RUN
run() {
  if (( DRY_RUN )); then printf '%s\n' "  [dry-run] $*"; else printf '%s\n' "  \$ $*"; "$@"; fi
}

# external write gate (execute-external per external-operation-guard): returns 0 to proceed
confirm_external() {
  local target="$1" op="$2"
  printf '%s\n' "外部寫入（execute-external）：$op → $target"
  if (( DRY_RUN )); then printf '%s\n' "  [dry-run] 不執行"; return 1; fi
  if (( ASSUME_YES )); then printf '%s\n' "  ASSUME_YES=1，視為已確認"; return 0; fi
  local reply
  read -r -n1 -p "  確認執行？[y/N] " reply || true
  printf '\n'
  [[ "$reply" == "y" ]]
}

# audit <target> <op> <result> — one line, four pipe-delimited fields.
# The operation text is flattened and truncated: PR bodies carry newlines and "|" (markdown tables),
# which would otherwise break the one-record-per-line format and make the log unparsable.
audit() {
  local op="${2//$'\n'/ ⏎ }"
  op="${op//|/／}"
  (( ${#op} > 300 )) && op="${op:0:300}…"
  mkdir -p "$TASK_DIR"
  printf '%s\n' "$(date '+%Y-%m-%d %H:%M') | $1 | $op | $3" >> "$AUDIT_LOG"
}

# A declined write returns 0 so the script runs to the end, but a run that skipped a push and exited 0
# reads as "pushed": a caller without a terminal (an agent, CI without --yes) declines every prompt
# silently. So skipped writes are collected and the exit trap reports them and turns the status into 3.
SKIPPED_EXTERNAL=()
skip_external() { # skip_external <target> <op>
  SKIPPED_EXTERNAL+=("$1：$2")
  log "跳過：$2"
}
report_skipped_external() {
  local rc=$? op
  (( DRY_RUN == 0 && ${#SKIPPED_EXTERNAL[@]} )) || return "$rc"
  printf '\n%s\n' "✗ 有 ${#SKIPPED_EXTERNAL[@]} 個外部寫入沒有執行，遠端還沒有這些變更：" >&2
  for op in "${SKIPPED_EXTERNAL[@]}"; do printf '%s\n' "  - $op" >&2; done
  printf '%s\n' "  確認後帶 --yes 重跑，或手動執行上面的指令" >&2
  (( rc == 0 )) && exit 3
  return "$rc"
}
trap report_skipped_external EXIT

# external command wrapped with confirmation + audit: external <target> <cmd...>
external() {
  local target="$1"; shift
  if confirm_external "$target" "$*"; then
    if "$@"; then audit "$target" "$*" success; else audit "$target" "$*" failure; return 1; fi
  else
    skip_external "$target" "$*"
    return 0
  fi
}

# Same gate as external(), but retries the command a few times. GitHub rejects a merge with
# "Base branch was modified" when the base moved between the PR being opened and merged, which
# happens routinely here: a staging deploy writes the ops declaration back to main while a feature
# PR is in flight. The merge itself is safe to repeat, so retry rather than abort the run.
external_retry() { # external_retry <target> <cmd>...
  local target="$1"; shift
  local i
  if ! confirm_external "$target" "$*"; then skip_external "$target" "$*"; return 0; fi
  for i in 1 2 3 4 5; do
    if "$@"; then audit "$target" "$*" success; return 0; fi
    (( i < 5 )) && { warn "第 $i 次失敗，5 秒後重試（基底分支可能剛被回寫）"; sleep 5; }
  done
  audit "$target" "$*" failure
  return 1
}

remote_target() { git remote get-url origin 2>/dev/null | sed -E 's#(git@|https://)([^/:]+)[:/]#\2/#; s#\.git$##; s#^[^@]+@##'; }

require_clean_tree() {
  [[ -z "$(git status --porcelain)" ]] && return 0
  if (( DRY_RUN )); then warn "工作區不乾淨（dry-run 下僅警告）"; return 0; fi
  die "工作區不乾淨，先 commit 或 stash"
}

current_branch() { git branch --show-current; }

# Remote release branches of one component, including its --to-main branch: release/<component>/vX.Y.
# A cap of one per component, not per repository: fact-kit and platform-facts release independently.
release_branches() { # release_branches <component>
  git branch -r --list "origin/release/$1/*" | sed 's#.*origin/##'
}

# The package directory of a component (config entry whose component matches; else packages/<component>)
unit_path() { # unit_path fact-kit -> packages/fact-kit
  local u="$1" p
  p="$(jq -r --arg u "$u" '.packages | to_entries[] | select(.value.component == $u) | .key' "$CONFIG" 2>/dev/null | head -1)"
  if [[ -n "$p" && -d "$p" ]]; then printf '%s\n' "$p"
  elif [[ -d "packages/$u" ]]; then printf '%s\n' "packages/$u"
  else return 1; fi
}

unit_component() { # unit_component packages/fact-kit -> fact-kit; the folder name when the config sets no component
  local p="${1%/}" c
  c="$(jq -r --arg p "$p" '.packages[$p].component // empty' "$CONFIG" 2>/dev/null)"
  printf '%s\n' "${c:-${p##*/}}"
}

manifest_version() { jq -r --arg p "$1" '.[$p] // empty' "$MANIFEST"; }

# Whether the unit has shipped before: release-please only applies its versioning strategy on top of a
# previous release; without one it takes initial-version verbatim. A unit counts as released when it has
# a <component>/v* tag or a real version in the manifest. This repo's fact-kit has a manifest version
# (0.4.0) but no tag, and release-please bumps from the manifest version, so a tag-only test would call
# it new and set a misleading initial-version.
unit_released() { # unit_released <component>
  local v
  [[ -n "$(git tag --list "$1/v*" | head -1)" ]] && return 0
  v="$(manifest_version "$(unit_path "$1" 2>/dev/null || true)" 2>/dev/null || true)"
  [[ -n "$v" && "$v" != 0.0.0 ]]
}

# strip a prerelease suffix: 1.2.0-rc.3 → 1.2.0
stable_version() { printf '%s\n' "${1%%-*}"; }

# components listed in the config on <ref> (default: working tree)
# shellcheck disable=SC2120 # <ref> is optional; most callers read the working tree
config_units() {
  local q='.packages | to_entries[] | (.value.component // (.key | split("/")[1]))'
  if [[ -n "${1:-}" ]]; then git show "$1:$CONFIG" | jq -r "$q"
  else jq -r "$q" "$CONFIG"; fi
}

# Release-Train-Base trailers carry the component: "Release-Train-Base: <component> <sha>". Each component
# has its own train and its own starting point, so a bare sha could not say whose it is.
# train_base_shas <component> <rev> [-n N] → shas of that component's trailers on <rev>, newest first
train_base_shas() {
  local comp="$1" rev="$2"; shift 2
  git log "$rev" "$@" --format='%(trailers:key=Release-Train-Base,valueonly)' 2>/dev/null \
    | sed -nE "s/^${comp} ([0-9a-f]{7,40})\$/\1/p" || true
}

# Components this train shipped: the manifest entries that differ from main's. Derived rather than read
# from the config, because merge-back restores the config from main and would otherwise lose the train
# scope, making the phase impossible to re-run.
train_units_by_manifest() {
  local p
  while IFS= read -r p; do [[ -n "$p" ]] && unit_component "$p"; done < <(
    jq -s -r '.[0] as $main | .[1] | to_entries[] | select(.value != $main[.key]) | .key' \
      <(git show origin/main:"$MANIFEST") "$MANIFEST")
  return 0
}

# --component and --line are validated the same way by all three scripts
check_component_line() { # check_component_line <component> <line>
  local known
  if git rev-parse -q --verify refs/remotes/origin/main >/dev/null; then known="$(config_units origin/main)"; else known="$(config_units)"; fi
  [[ -n "$1" ]] || die "--component 必填（$(paste -sd '|' - <<<"$known")）"
  grep -qx -- "$1" <<<"$known" || die "--component 需為 $(paste -sd '|' - <<<"$known")（目前 $1）"
  [[ "$2" =~ ^[0-9]+\.[0-9]+$ ]] || die "--line 需為 X.Y"
}

# release stages (alpha → beta → rc → ga) and the steps that move a train between them
source "$(dirname "${BASH_SOURCE[0]}")/release-stages.sh"
