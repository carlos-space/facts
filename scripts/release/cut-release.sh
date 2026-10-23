#!/usr/bin/env bash
# Open a release train for one package: create release/<component>/v<line> and scope release-please to
# that package, in prerelease mode at the starting stage, so it gets its own X.Y.Z-<stage>.N while the
# train stabilises. advance-release.sh moves the train on (alpha → beta → rc → ga, forward only).
#
# usage: cut-release.sh --component fact-kit|platform-facts --line X.Y [--stage alpha|beta|rc|ga] [--from main|<component>/vX.Y.Z] [--yes] [--dry-run]
#   --component  the package this train releases; names the branch release/<component>/v<line>.
#                Each package has its own train, its own branch cap (one) and its own starting point.
#   --line       X.Y of the version being released (0.4 for 0.4.1, 0.5 for 0.5.0).
#   --stage      starting stage; default alpha. ga skips prerelease mode: the train's first Release PR
#                is already the final version.
#   --from       base: main (default) or a tag such as fact-kit/v0.4.0, for a patch train.
#                Once the line has a <component>/vX.Y.Z tag, --from must name its latest one.
#   --dry-run    print the branch, the scoped config and the commit; write nothing and push nothing.
#
# No version is pinned here: release-please's prerelease strategy derives the package's next version
# from its own commits. The config's prerelease-type is "<stage>.1", which the strategy appends to the
# first bump (0.4.0 + fix → 0.4.1-alpha.1). The line therefore names the branch and gates the base; it does
# not choose the version. A feat commit on a patch line gives 0.5.0-alpha.1, so keep feat out of a patch line.
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
cd "$REPO_ROOT"

component="" line="" from="main" requested_stage=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --component) component="$2"; shift 2 ;;
    --line) line="$2"; shift 2 ;;
    --stage) requested_stage="$2"; shift 2 ;;
    --from) from="$2"; shift 2 ;;
    --yes) ASSUME_YES=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,${/^#/!q; p;}' "$0"; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done
check_component_line "$component" "$line"
branch="release/$component/v$line"
if [[ -n "$requested_stage" ]]; then
  is_stage "$requested_stage" || die "--stage 需為 ${RELEASE_STAGES[*]}"
  stage="$requested_stage"
else
  stage="${RELEASE_STAGES[0]}"
fi

require_clean_tree
run git fetch --prune --tags origin
declare -a existing=()
while IFS= read -r b; do [[ -n "$b" ]] && existing+=("$b"); done < <(release_branches "$component")
[[ -z "${existing[0]:-}" ]] || die "遠端已有 ${component} 的 release 分支：${existing[*]}（不變式：每個套件任一時刻 ≤ 1 條）"
git rev-parse -q --verify "refs/heads/$branch" >/dev/null && die "本地已有 ${branch}，先刪除或改用它"

# A line that already shipped takes patches only, and a patch must continue from the line's latest
# GA: cut from main it carries everything merged since, cut from an older tag it drops a shipped fix.
# Refuse instead of picking the tag, so the base stays explicit.
shipped="$(line_shipped_tag "$component" "$line")"
if [[ -n "$shipped" && "$from" != "$shipped" ]]; then
  die "${component} 的 v${line} 線已發布到 ${shipped}，修補發布要接在它後面（目前起點 ${from}）：改帶 --from ${shipped}。修正已在 main 時，切出後把它 cherry-pick 進 ${branch}。要發下一個 minor 就改用新的 --line"
fi
if [[ "$from" == "main" ]]; then base="origin/main"; else
  git rev-parse -q --verify "refs/tags/$from" >/dev/null || die "起點 tag 不存在：${from}（發布後的修補要自 ${component}/vX.Y.Z tag 重建，不從 main）"
  [[ "$from" == "$component/"* ]] || die "起點 tag ${from} 不屬於 ${component}"
  base="$from"
fi
path="$(unit_path "$component")" || die "找不到套件目錄：$component"

log "切 ${branch}（base ${base}），套件：${component}（${path}）"
run git switch -c "$branch" "$base"

# A train rebuilt from a tag also rewinds scripts/, the workflows and the config to that tag; refresh the
# release tooling from main so the train runs the current flow, not the flow of the day it shipped. The
# workflows come along because release-please.yml and publish.yml of an old tag may not have the release/**
# trigger or the stage input at all.
if [[ "$from" != "main" ]]; then
  log "自 main 更新發布工具與 workflow（重建的 train 否則會跑該 tag 當時的舊版本）"
  run git checkout origin/main -- scripts .github "$CONFIG"
  if (( DRY_RUN )); then info "[dry-run] 以 main 的 manifest 為底補上其他套件的版號"; else
    keep="\"$path\""
    tmp="$(mktemp)"
    jq -s --argjson keep "[$keep]" '.[0] * (.[1] | with_entries(select(.key as $k | $keep | index($k))))' \
      <(git show origin/main:"$MANIFEST") "$MANIFEST" > "$tmp" && mv "$tmp" "$MANIFEST"
    git add scripts .github "$CONFIG" "$MANIFEST" 2>/dev/null || true
  fi
fi

# Where this train should start counting commits.
#
# release-please walks main's history newest-first and stops at the previous release's commit. A
# commit that landed on main while the previous train was stabilising is *older* than that release
# commit, so the walk never reaches it and the change is silently dropped from the next release.
# Anchoring on the previous train's branch point instead makes those commits visible again. The
# cost is that a fix already shipped by the previous train can appear once more in this train's
# changelog, which is the usual behaviour of release-branch workflows.
# 前一次發布的切點由它自己在合回時寫進 commit 訊息的 Release-Train-Base trailer（帶套件名，只讀本套件的），
# 不靠事後反推：發布分支以 squash 合回，main 上沒有可取父節點的 merge commit，且切點本來就是切分支當下已知的事實。
if [[ "$from" == "main" ]]; then
  # 修補發布自 tag 重建，它合回時寫進 main 的 Release-Train-Base 指向發布分支上的 commit，而發布分支
  # 以 squash 合回，那個 commit 不是 main 的祖先。以它為界，回溯永遠走不到而重新計入全部歷史。
  # 逐筆往回找，取第一個確實在起點歷史上的切點。
  prev_cut=""
  while IFS= read -r c; do
    [[ -n "$c" ]] || continue
    if git merge-base --is-ancestor "$c" "$base" 2>/dev/null; then prev_cut="$c"; break; fi
    info "略過非主線切點 ${c:0:7}（修補發布自 tag 重建，其切點不在 main 上）"
  done < <(train_base_shas "$component" origin/main -n 200)
else
  # 自 tag（如 fact-kit/v0.4.0）重建的修補發布：該 tag 之前的內容全部已發布，起算點就是它本身。
  # 沿用前一次發布的切點會把上一版已發過的功能重新計入，把 patch 誤算成 minor。
  prev_cut="$(git rev-parse "${from}^{commit}")"
fi

# A package that has never shipped has no release for the prerelease strategy to bump from, so
# release-please would take initial-version verbatim. Start it at this line, in the same format the
# stage gives a package that has shipped.
if [[ "$stage" == ga ]]; then initial="${line}.0"; else initial="${line}.0-$(stage_prerelease_type "$stage")"; fi
declare -a fresh=()
if unit_released "$component"; then
  if [[ "$stage" == ga ]]; then info "${component}：目前 $(manifest_version "$path")，正式版號由 release-please 依 commit 計算"
  else info "${component}：目前 $(manifest_version "$path")，第一個版本由 release-please 依 commit 計算為 X.Y.Z-$(stage_prerelease_type "$stage")"; fi
else
  fresh+=("$path"); info "${component}：首次發布，起始版號 ${initial}"
fi
freshj="[]"; (( ${#fresh[@]} )) && { freshj="$(printf '"%s",' "${fresh[@]}")"; freshj="[${freshj%,}]"; }

# scope the config to the package; a prerelease stage switches it to prerelease mode, ga leaves it as is
keep="\"$path\""
tmp="$(mktemp)"
ptype=""; [[ "$stage" == ga ]] || ptype="$(stage_prerelease_type "$stage")"
jq --argjson keep "[$keep]" --arg sha "${prev_cut:-}" \
  --argjson fresh "$freshj" --arg initial "$initial" --arg ptype "$ptype" '
  .packages |= with_entries(select(.key as $k | $keep | index($k)))
  | .packages |= with_entries(if (.key as $k | $fresh | index($k)) then .value."initial-version" = $initial else . end)
  | if $ptype == "" then . else .versioning = "prerelease" | ."prerelease-type" = $ptype | .prerelease = true end
  | if $sha == "" then . else ."last-release-sha" = $sha end
' "$CONFIG" > "$tmp"
if [[ -n "${prev_cut:-}" ]]; then
  [[ "$from" == "main" ]] && info "起算點：${prev_cut:0:7}（前一次發布自 main 的切點）" || info "起算點：${prev_cut:0:7}（${from}）"
else
  info "起算點：無前一次發布，自歷史起頭計算"
fi
info "起始階段：${stage}（$(stage_env "$stage")）"
if (( DRY_RUN )); then info "[dry-run] $CONFIG 會縮為："; jq -c '{versioning, "prerelease-type", prerelease, "last-release-sha", packages: (.packages|keys), initial: [.packages | to_entries[] | select(.value."initial-version") | "\(.key)=\(.value."initial-version")"]}' "$tmp"; rm -f "$tmp"; else mv "$tmp" "$CONFIG"; fi
run git add "$CONFIG"
base_sha="$(git rev-parse "${base}^{commit}")"
if [[ "$stage" == ga ]]; then
  body="起始階段 ga：不進 prerelease 模式，release-please 於本分支直接為 ${component} 計算正式版號。"
else
  body="起始階段 ${stage}：release-please 於本分支以 prerelease 模式為 ${component} 計算 -${stage}.N 版號；advance-release.sh 往後推進，到 ga 時由 finalize-release.sh 收斂。"
fi
run git commit -q -m "chore($branch): open train at $stage with $component" -m "$body

Release-Train-Base: $component $base_sha"

log "推送分支（觸發 release-please → ${component} 的 Release PR）"
external "$(remote_target)" git push -u origin "$branch"
printf '\n'
if [[ "$stage" == ga ]]; then
  info "下一步：合併 Release PR → ${component}/vX.Y.Z tag → finalize-release.sh --component $component --line $line --phase merge-back"
else
  info "下一步：合併 Release PR → ${component}/vX.Y.Z-${stage}.N tag → 發布到 npm dist-tag ${stage}。"
  info "hotfix：hotfix/<issue>-<kebab> 從 $branch 切、PR 合回 ${branch}（Refs #N），每次合入再開一次 Release PR。"
  later="${RELEASE_STAGES[*]:$(( $(stage_index "$stage") + 1 ))}"
  info "推進：advance-release.sh --component $component --line $line [--to ${later// /|}]"
fi
