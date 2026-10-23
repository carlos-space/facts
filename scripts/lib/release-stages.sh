#!/usr/bin/env bash
# Release stages of a train and the steps that move a train between them. Sourced by common.sh;
# do not execute.
#
# A train walks alpha → beta → rc → ga, forward only. A train is one package: release/<component>/vX.Y,
# where <component> is fact-kit or platform-facts. There is no deployment here; the environment of every
# prerelease stage is the npm registry, where the stage is the dist-tag (alpha | beta | rc) and ga is
# latest. A stage exists when the repo has a publishable npm package, which it always has, so no stage is
# skipped. Any stage may be skipped on request: a train may go from alpha straight to rc or to ga.

RELEASE_STAGES=(alpha beta rc ga)

stage_env() { # stage_env <stage> → where the stage lands
  case "$1" in
    alpha | beta | rc) printf '%s\n' "npm dist-tag $1" ;;
    ga) printf '%s\n' "npm dist-tag latest" ;;
    *) return 1 ;;
  esac
}

stage_index() { # stage_index <stage> → 0-based position in RELEASE_STAGES
  local i
  for i in "${!RELEASE_STAGES[@]}"; do
    [[ "${RELEASE_STAGES[$i]}" == "$1" ]] && { printf '%s\n' "$i"; return 0; }
  done
  return 1
}

is_stage() { stage_index "$1" >/dev/null; }

# Every stage has an environment (the registry), so nothing is skipped. The two functions below keep the
# call sites of the template's flow intact.
stage_has_env() { is_stage "$1"; }
stages_available() { printf '%s\n' "${RELEASE_STAGES[@]}"; }
stage_first_available() { is_stage "$1" && printf '%s\n' "$1"; }

# stage_version <version> <stage> → the version a package enters <stage> with: 1.2.0-alpha.3 → 1.2.0-beta.1.
# This is semver's inc(v, 'prerelease', <stage>, '1') for a prerelease input, written out in bash so the
# repo needs no semver dependency. A stable input is refused: its next version depends on commit types.
stage_version() {
  local v="$1" id="$2"
  [[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+-[0-9A-Za-z.-]+$ ]] || return 1
  printf '%s\n' "${v%%-*}-${id}.1"
}

# version_stage <version> → the stage a package version belongs to: ga for X.Y.Z, <stage> for
# X.Y.Z-<stage>.N with <stage> one of alpha, beta, rc. Any other shape fails, because publishing derives
# its dist-tag from the stage and must not guess one.
version_stage() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)\.[0-9]+)?$ ]] || return 1
  printf '%s\n' "${BASH_REMATCH[2]:-ga}"
}

# prerelease-type the config carries in <stage>. release-please appends it verbatim when a package with a
# stable version takes its first change (0.4.0 + fix → 0.4.1-alpha.1) and afterwards only bumps the
# trailing number, so "<stage>.1" makes every stage start at .1 without pinning a version.
stage_prerelease_type() { printf '%s\n' "$1.1"; }

# train_stage [<config file>] → the stage the train's config declares: the prerelease-type without its
# number while in prerelease mode, ga otherwise
train_stage() {
  local cfg="${1:-$CONFIG}" type
  if [[ "$(jq -r '.prerelease // false' "$cfg")" != true ]]; then printf '%s\n' ga; return 0; fi
  type="$(jq -r '."prerelease-type" // empty' "$cfg")"
  type="${type%%.*}"
  if ! is_stage "$type" || [[ "$type" == ga ]]; then
    die "$cfg 的 prerelease-type 是「${type}」，不是 ${RELEASE_STAGES[*]:0:3} 之一，無法判斷發布分支所在階段"
  fi
  printf '%s\n' "$type"
}

# train_commits_not_on_main <rev> <component> [-- <pathspec>...] → "<short sha> <subject>" for each commit
# the train made after it was opened (the newest commit carrying this component's Release-Train-Base
# trailer) that origin/main does not have yet. A commit counts as on main when main has a patch-equivalent
# commit, or when it was cherry-picked ("cherry picked from commit X") from a commit already on main.
# Merge-back is a squash, so ancestry alone cannot answer this: every train commit is off main's history.
train_commits_not_on_main() {
  local rev="$1" comp="$2"; shift 2
  [[ "${1:-}" == -- ]] && shift
  local open mark sha src
  # No pipe into an early-exiting reader here: under pipefail the writer's SIGPIPE fails the function.
  open="$(git log -1 --format=%H -E --grep="^Release-Train-Base: ${comp} [0-9a-f]{7,40}\$" "$rev")"
  [[ -n "$open" ]] || return 0
  while read -r mark sha; do
    [[ "$mark" == + ]] || continue
    (( $# == 0 )) || [[ -n "$(git diff-tree --no-commit-id --name-only -r "$sha" -- "$@")" ]] || continue
    src="$(git log -1 --format=%B "$sha" | sed -nE 's/^\(cherry picked from commit ([0-9a-f]{7,40})\)$/\1/p' | tail -1)"
    if [[ -n "$src" ]] && git merge-base --is-ancestor "$src" origin/main 2>/dev/null; then continue; fi
    git log -1 --format='%h %s' "$sha"
  done < <(git cherry origin/main "$rev" "$open")
}

# Bring the local train up to its remote. Fetch even under --dry-run; fetching only updates local refs.
train_sync() { # train_sync <branch>
  local branch="$1"
  git fetch --quiet --tags origin || die "無法從 origin 抓取 tag 與 main，起點閘需要遠端最新的 tag"
  # 明確用遠端追蹤 ref：release-please 的工作分支名尾端同樣是 "$branch"，
  # 以短 refname pull 會同時命中兩條而報 "Cannot fast-forward to multiple branches"
  run git merge --ff-only "origin/$branch"
}

# Latest GA tag of a component's line: <component>/vX.Y.Z with the given X.Y, highest patch
line_shipped_tag() { # line_shipped_tag <component> <line>
  git tag --list "$1/v${2}.*" | grep -E "^$1/v${2//./\\.}\.[0-9]+\$" | sort -t. -k3,3n | tail -1 || true
}

# Gates a train passes before it moves to <stage>, run after train_sync. The ci gate is called the
# GA gate when the train goes to ga, which is how the docs know it.
train_gates() { # train_gates <branch> <component> <line> <stage>
  local branch="$1" comp="$2" line="$3" stage="$4" shipped st gate_ok rest tip i gate act ahead
  if [[ "$stage" == ga ]]; then gate="GA 閘" act="跑 GA"; else gate="ci 閘" act="推進到 $stage"; fi
  # Scripts gate: the train must run main's release tooling. A train rebuilt by hand from an old tag
  # carries that tag's scripts, which may predate a gate. cut-release.sh syncs scripts/ from main
  # when it cuts, so only a hand-made or long-lived train trips this.
  # The difference can also run the other way: a hotfix to scripts/ committed on the train only.
  # Syncing from main would wipe that hotfix, so name those commits and send them to main first.
  if ! git diff --quiet origin/main -- scripts; then
    ahead="$(train_commits_not_on_main HEAD "$comp" -- scripts)"
    [[ -z "$ahead" ]] \
      || die "發布分支有 main 還沒有的腳本修正，先把它們帶回 main 再${act}：把下列 commit cherry-pick 到 main 並合進去，再用 git checkout origin/main -- scripts 同步 ${branch}。直接同步會蓋掉這些修正："$'\n'"$ahead"
    die "發布腳本落後 main：${branch} 的 scripts/ 與 origin/main 不同。先同步再${act}：git checkout origin/main -- scripts，commit 後推上 ${branch}"
  fi
  # Base gate: a line that already shipped takes patches only, and a patch must continue from the
  # line's latest tag of this component. cut-release.sh refuses any other base. Here it catches a train
  # opened by hand from main (merge-back is a squash, so the tag is never main's ancestor) or from an
  # older tag.
  shipped="$(line_shipped_tag "$comp" "$line")"
  if [[ -n "$shipped" ]]; then
    git merge-base --is-ancestor "${shipped}^{commit}" HEAD \
      || die "起點閘未通過：${branch} 不含 ${comp} 在 v${line} 線的最後一個 tag ${shipped}。修補發布要從它重建：刪掉這條分支，用 cut-release.sh --component ${comp} --line ${line} --from ${shipped} 重切，修正再 cherry-pick 進去"
    info "✓ 起點含 ${shipped}"
  fi
  # ci gate: the ci run of the train's tip (check, build and test) must be green. Every push to release/**
  # gets a ci run (ci.yml), so the gate waits for the run of this exact commit. The last push is usually a
  # Release PR merge, so that run is often still queued or in progress when the stage moves.
  if (( DRY_RUN == 0 )) && [[ "${CI_GATE:-1}" == 1 ]]; then
    tip="$(git rev-parse "origin/$branch")"
    log "${gate}：等待 $branch 最新 commit ${tip:0:7} 的 ci 執行完成"
    gate_ok=0
    for ((i=1; i<=${CI_GATE_TRIES:-40}; i++)); do
      st="$(gh run list --workflow ci.yml --branch "$branch" --commit "$tip" --limit 1 --json status,conclusion,databaseId \
            --jq '.[0] | "\(.status)/\(.conclusion // "")/\(.databaseId)"' 2>/dev/null || true)"
      [[ -z "$st" ]] && { warn "${tip:0:7} 尚無 ci 執行紀錄，等待中"; sleep "${CI_GATE_SLEEP:-15}"; continue; }
      case "$st" in
        completed/success/*) info "✓ ci run ${st##*/} 通過"; gate_ok=1; break ;;
        completed/*) rest="${st#completed/}"; die "${gate}未通過：ci run ${st##*/} 結論為 ${rest%%/*}（查 gh run view ${st##*/}）；修正後重跑，或以 CI_GATE=0 略過" ;;
        *) sleep "${CI_GATE_SLEEP:-15}" ;;
      esac
    done
    (( gate_ok )) || die "${gate}逾時：$branch 最新 commit ${tip:0:7} 的 ci 仍未完成"
  fi
}

# One commit per package carrying "Release-As: <version>", for every package of the train that shipped a
# prerelease: <stage> ga strips the suffix (0.4.1-rc.2 → 0.4.1), a prerelease stage restarts at .1
# (0.4.1-alpha.3 → 0.4.1-beta.1). A package still on a stable version has not released in this train and
# is left alone. Under DRY_RUN it only lists the moves.
train_release_as() { # train_release_as <branch> <stage>
  local branch="$1" stage="$2" u p cur next id
  local -a units=()
  while IFS= read -r u; do [[ -n "$u" ]] && units+=("$u"); done < <(config_units)
  for u in "${units[@]}"; do
    p="$(unit_path "$u")"
    cur="$(manifest_version "$p")"
    [[ "$cur" == *-* ]] || { info "⊘ ${u}（${cur}）本次發布未發過 prerelease，略過"; continue; }
    if [[ "$stage" == ga ]]; then next="$(stable_version "$cur")"; else
      id="${cur#*-}"; id="${id%%.*}"
      if is_stage "$id" && (( $(stage_index "$id") >= $(stage_index "$stage") )); then
        die "${u} 的版號 ${cur} 已在 ${id}，不能再進入 ${stage}"
      fi
      next="$(stage_version "$cur" "$stage")"
    fi
    info "${u}：$cur → $next"
    (( DRY_RUN )) && continue
    release_as_commit "$branch" "$u" "$p" "$next"
  done
}

# release-please 依「commit 觸及哪些路徑」歸屬 Release-As，所以這個 commit 必須觸及本套件路徑；又不能
# 是空的，因為空 commit 會被歸屬到所有路徑（src/manifest.ts 的 CommitSplit includeEmpty: true）。
# 標記檔為此存在，時間戳讓重跑時仍產生真實 diff。它只活在發布分支上，merge-back 會先刪掉再算差異，
# 不進 main。兩個套件的 package.json "files" 白名單都不列它，所以不會進 npm 套件；
# 核對方式：pnpm pack 後解開，不該出現 .release-marker。
release_as_commit() { # release_as_commit <branch> <component> <path> <version>
  local branch="$1" u="$2" p="$3" v="$4"
  {
    printf '%s\n' "$v"
    printf '%s\n' "#"
    printf '%s\n' "# 由發布腳本在推進階段或 GA 時寫入，用途只有一個：讓帶 Release-As footer 的"
    printf '%s\n' "# commit 觸及本套件路徑且非空。發布結束前會被刪除，不會進入 main。"
    printf '%s\n' "# released from $branch at $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  } > "$p/.release-marker"
  git add "$p/.release-marker"
  git commit -q -m "chore($branch): $u $v" -m "Release-As: $v"
}
