#!/usr/bin/env bash
# Move a release train forward to a later stage: alpha → beta → rc → ga. Forward only: a target at or
# before the train's current stage is refused.
#
# usage: advance-release.sh --component fact-kit|platform-facts --line X.Y [--to beta|rc|ga] [--yes] [--dry-run]
#   --to   target stage; default is the stage after the current one. Any stage may be skipped.
#
# The current stage is what the train's config declares: its prerelease-type while in prerelease mode,
# ga once it has left. Entering a prerelease stage writes one Release-As commit for the package if it
# already shipped a prerelease in this train (0.4.1-alpha.3 → 0.4.1-beta.1), then moves prerelease-type to
# the new stage. The Release-As is what switches the stage: for a version that is already a prerelease,
# release-please only bumps its trailing number and never reads prerelease-type. A package still on a
# stable version has not released in this train; when it does, prerelease-type gives it the new stage.
# Reaching ga hands over to finalize-release.sh --phase ga, unchanged.
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
cd "$REPO_ROOT"

component="" line="" requested=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --component) component="$2"; shift 2 ;;
    --line) line="$2"; shift 2 ;;
    --to) requested="$2"; shift 2 ;;
    --yes) ASSUME_YES=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,${/^#/!q; p;}' "$0"; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done
check_component_line "$component" "$line"
[[ -z "$requested" ]] || is_stage "$requested" || die "--to 需為 ${RELEASE_STAGES[*]:1}"
branch="release/$component/v$line"

require_clean_tree
[[ "$(current_branch)" == "$branch" ]] || die "請在 $branch 上執行（目前 $(current_branch)）"
train_sync "$branch"

current="$(train_stage)"
ci="$(stage_index "$current")"
(( ci + 1 < ${#RELEASE_STAGES[@]} )) \
  || die "$branch 已是 ga，沒有下一個階段。GA 中途失敗要重跑時用 finalize-release.sh --component $component --line $line --phase ga"
[[ -n "$requested" ]] || requested="${RELEASE_STAGES[$((ci + 1))]}"
ri="$(stage_index "$requested")"
if (( ri < ci )); then die "不能往回：$branch 目前在 ${current}，目標 ${requested} 在它之前"; fi
if (( ri == ci )); then
  hint=""
  [[ -n "$(git rev-list "origin/$branch..HEAD" 2>/dev/null)" ]] \
    && hint="；本機比 origin/$branch 多出 commit，前一次推進若只差推送，執行 git push origin $branch"
  die "$branch 已在 ${current}，只能往後推進${hint}"
fi
target="$(stage_first_available "$requested")"
log "${branch}：${current} → ${target}"

if [[ "$target" == ga ]]; then
  log "交給 finalize-release.sh --phase ga"
  DRY_RUN="$DRY_RUN" ASSUME_YES="$ASSUME_YES" \
    exec bash "$(dirname "$0")/finalize-release.sh" --component "$component" --line "$line" --phase ga
fi

train_gates "$branch" "$component" "$line" "$target"
log "進入 ${target}：已發過 prerelease 的套件從 .1 開始"
train_release_as "$branch" "$target"
ptype="$(stage_prerelease_type "$target")"
if (( DRY_RUN )); then info "[dry-run] ${CONFIG}：prerelease-type → ${ptype}"; else
  tmp="$(mktemp)"; jq --arg t "$ptype" '."prerelease-type" = $t' "$CONFIG" > "$tmp" && mv "$tmp" "$CONFIG"
  git add "$CONFIG"
  git commit -q -m "chore($branch): enter $target" -m "prerelease-type 改為 ${ptype}：之後才第一次發版的套件也從 ${target} 開始。"
fi
external "$(remote_target)" git push origin "$branch"
printf '\n'
info "下一步：合併 Release PR → ${component}/vX.Y.Z-${target}.1 tag → 發布到 npm dist-tag ${target}。"
later="${RELEASE_STAGES[*]:$(( $(stage_index "$target") + 1 ))}"
info "再推進：advance-release.sh --component $component --line $line [--to ${later// /|}]"
