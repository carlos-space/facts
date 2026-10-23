#!/usr/bin/env bash
# Close a release train (one package) in three phases:
#   ga          the package gets a "Release-As: <its own stable version>" commit (the prerelease suffix
#               stripped from its current version), and the config leaves prerelease mode. Release-As is
#               a per-commit footer and release-please attributes it to the paths that commit touches.
#               advance-release.sh --to ga hands over to this phase; the earlier stages are its job.
#   merge-back  verify the GA tag; drop the markers; restore the config and the other packages' manifest
#               entries from main; open the release PR → main. That PR is merged with *squash*: the
#               train's own release commits must not enter main's timeline, or the next train's commit walk
#               stops at them and silently drops whatever landed on main while this train was stabilising.
#               main never carries a release-please commit: the version file, CHANGELOG and manifest entry
#               reach main only through this PR.
#   close       merge that PR with a squash message this script controls, so Release-Train-Base stays the
#               last line main can read; delete the branches; run the close checklist against origin/main.
#               It never switches to main, which is often checked out in another worktree. The tag
#               <component>/vX.Y.Z already sits on the train (release-please made it); it is not moved to
#               main's merge result, which carries whatever landed on main during stabilisation and was
#               never released. A patch train rebuilt from that tag would drag those changes into a patch.
#
# usage: finalize-release.sh --component fact-kit|platform-facts --line X.Y --phase ga|merge-back|close [--yes] [--dry-run]
set -euo pipefail
source "$(dirname "$0")/../lib/common.sh"
cd "$REPO_ROOT"

component="" line="" phase=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --component) component="$2"; shift 2 ;;
    --line) line="$2"; shift 2 ;;
    --phase) phase="$2"; shift 2 ;;
    --yes) ASSUME_YES=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,${/^#/!q; p;}' "$0"; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done
check_component_line "$component" "$line"
branch="release/$component/v$line"
target="$(remote_target)"
sync_branch="${branch}--to-main"

case "$phase" in
  ga)
    require_clean_tree
    [[ "$(current_branch)" == "$branch" ]] || die "請在 $branch 上執行（目前 $(current_branch)）"
    # Sync before the gates: they read the remote too (the base gate needs the line's latest tag, the
    # scripts gate compares against origin/main). Merging a stale ref and then fetching would compare an
    # old local train against a fresh main.
    train_sync "$branch"
    train_gates "$branch" "$component" "$line" ga
    log "收斂 prerelease：${component} 以自身版號定案"
    train_release_as "$branch" ga
    tmp="$(mktemp)"; jq '.prerelease = false' "$CONFIG" > "$tmp"
    # 重跑 GA（前一次在合併 Release PR 之後失敗）時設定已是非 prerelease，無條件 commit 會因無變更而中止
    if (( DRY_RUN )); then rm -f "$tmp"; else
      mv "$tmp" "$CONFIG"; git add "$CONFIG"
      if git diff --cached --quiet -- "$CONFIG"; then info "⊘ 設定已離開 prerelease 模式"
      else git commit -q -m "chore($branch): leave prerelease mode"; fi
    fi
    external "$target" git push origin "$branch"
    printf '\n'
    info "下一步：合併 Release PR → ${component}/vX.Y.Z 正式 tag → npm latest。"
    info "之後執行：finalize-release.sh --component $component --line $line --phase merge-back"
    ;;

  merge-back)
    require_clean_tree
    [[ "$(current_branch)" == "$branch" ]] || die "請在 $branch 上執行"
    run git fetch --prune --tags origin
    run git merge --ff-only "origin/$branch"
    train_base="$(train_base_shas "$component" "$branch" | head -1)"
    [[ -n "$train_base" ]] || die "$branch 上找不到 Release-Train-Base: $component <sha> trailer，無法決定差異範圍"
    declare -a units=()
    while IFS= read -r u; do [[ -n "$u" ]] && units+=("$u"); done < <(train_units_by_manifest "$train_base")
    (( ${#units[@]} )) || die "本分支與開分支時的 manifest 無差異，沒有可合回的發布"
    [[ "${units[*]}" == "$component" ]] || die "這條分支的 manifest 與開分支時的差異是 ${units[*]}，應只有 ${component}"
    path="$(unit_path "$component")"
    version="$(manifest_version "$path")"
    [[ "$version" == *-* ]] && die "GA 尚未完成：$component 仍是 prerelease $version（先合併 Release PR 並等 tag 建立）"
    git rev-parse -q --verify "refs/tags/$component/v$version" >/dev/null \
      || die "GA 尚未完成：缺 tag $component/v$version（先合併 Release PR 並等 tag 建立）"

    # 標記檔只為了讓 GA 的 Release-As commit 觸及套件路徑而存在，任務已完成。刪掉後「建立又刪除」
    # 的淨差異為零，main 永遠看不到它們。這個 commit 只含 chore、不帶 Release-As，release-please 會判為
    # 「No user facing commits」而跳過，不會多開一次 Release PR。
    if compgen -G "*/*/.release-marker" >/dev/null 2>&1; then
      run git rm -q --ignore-unmatch */*/.release-marker
      run git commit -q -m "chore($branch): drop release markers"
      external "$target" git push origin "$branch"
    else
      info "⊘ 發布分支已是最終樣子（標記檔已刪）"
    fi

    # 發布分支的基底不一定在 main 上：squash 合回讓上一次發布的 tip 不是 main 的祖先，因此自 tag
    # 重建的修補發布與 main 沒有近共同祖先，直接合併會讓版號檔、CHANGELOG 全數衝突。改為在 main 之上
    # 套用發布分支的差異，合回因此永遠是一次乾淨的單一 commit。
    # 只套 main 還沒有的 commit，不套「基底 → 最後一個 commit」整段：修補發布的修正常先進 main 再
    # cherry-pick 進發布分支，自 tag 重建時開分支的 commit 也同步了 main 的 scripts/。整段套用會把這些
    # 變更重套一次，已刪的檔報錯、改過的檔衝突。開分支的 commit 一律不套，
    # 它改的設定與 manifest 不進 main，manifest 由下一步另外合併。
    pending_list="$(train_commits_not_on_main "origin/$branch" "$component")" || die "無法列出 $branch 上 main 還沒有的 commit"
    declare -a pending=()
    while IFS= read -r c; do [[ -n "$c" ]] && pending+=("${c%% *}"); done <<< "$pending_list"
    log "在 main 之上建立合回分支 ${sync_branch}（套用發布分支上 main 還沒有的 ${#pending[@]} 個 commit）"
    run git switch -C "$sync_branch" origin/main
    for c in "${pending[@]}"; do
      if (( DRY_RUN )); then info "[dry-run] 套用 $(git log -1 --format='%h %s' "$c")"; continue; fi
      git diff "$c^" "$c" -- . ':!release-please-config.json' | git apply --3way --allow-empty \
        || die "套用 $(git log -1 --format='%h %s' "$c") 時衝突，請手動處理後再執行本階段"
    done

    log "以 main 的 manifest 為底，只保留 ${component} 的版號"
    if (( DRY_RUN )); then info "[dry-run] merge $MANIFEST with origin/main"; else
      tmp="$(mktemp)"
      jq -s --arg keep "$path" '.[0] * (.[1] | with_entries(select(.key == $keep)))' \
        <(git show origin/main:"$MANIFEST") <(git show "origin/$branch:$MANIFEST") > "$tmp" && mv "$tmp" "$MANIFEST"
      jq -c . "$MANIFEST"
    fi
    run git add -A
    title="chore(release): $component v$version → main"
    if [[ -n "$(git diff --cached --name-only)" ]]; then
      run git commit -q -m "$title" -m "自 $branch 套用發布內容；發布分支自身的發版 commit 不進主線。

Release-Train-Base: $component $train_base"
    else
      info "合回內容已存在，略過提交"
    fi
    # 不強制推送：合回分支每次都從 main 重建，遠端已有內容不同的同名分支表示前一次合回沒收完，
    # 覆寫前要人確認。內容相同時（重跑）不必再推。
    if git rev-parse -q --verify "refs/remotes/origin/$sync_branch" >/dev/null; then
      if (( DRY_RUN )) || git diff --quiet "origin/$sync_branch" HEAD; then
        info "⊘ 遠端的 ${sync_branch} 已是這次的合回內容"
      else
        die "遠端的 ${sync_branch} 和這次的合回內容不同（前一次合回沒收完）。確認可以覆寫後自己執行：git push --force-with-lease origin ${sync_branch}，再重跑本階段"
      fi
    else
      external "$target" git push origin "$sync_branch"
    fi

    # Release-Train-Base 必須寫在 PR body 裡：release PR 以 squash 合併，GitHub 取 PR 標題加
    # 內文作為 commit 訊息，合回分支上那個 commit 的訊息會整個被丟棄。放錯位置的後果是
    # last-release-sha 永遠設不起來，下一次發布回溯整條歷史而把已發布的變更重新計入。
    # git 只認最後一個段落的 trailer，附在 body 結尾即可解析。
    # 最後一段的關閉關鍵字寫成 "Closes: #N"：沒有冒號的 "Closes #N" 不是 git trailer，和
    # Release-Train-Base 同段時會讓 git 整段都不當 trailer 解析。GitHub 接受關鍵字後面加冒號。
    refs="$(git log "$train_base".."origin/$branch" --format=%B | grep -oE 'Refs:? #[0-9]+' | grep -oE '[0-9]+' | sort -nu | sed 's/^/Closes: #/' || true)"
    if [[ -n "$refs" ]]; then hotfix_note="集中關閉發布期間 hotfix 的 Issue，列在最後一段。"
    else hotfix_note="這次發布沒有 hotfix Issue。"; fi
    body="$(cat <<BODY
## 動機
${component} v${version} 的 tag 已建立，把發布分支 $branch 的內容套回 main。發布分支自身的發版 commit 不進 main，所以以 squash 合併。

## 變更
- 自 $branch 套用發布內容：${component} 的版號檔、CHANGELOG 與 manifest 項目（${path}: ${version}）
- tag：\`${component}/v${version}\`

## 影響
- main 的 ${component} 版號檔與 CHANGELOG 前進到這次發布，其他套件的版號不變。
- 合併後刪除 ${branch}，tag 留在發布分支的最後一個 commit。
- $hotfix_note

## 驗證
- 合併前等這個 PR 的 checks 全數通過。

${refs:+$refs
}Release-Train-Base: $component $train_base
BODY
)"
    existing="$(gh pr list --base main --head "$sync_branch" --state open --json number --jq '.[0].number // empty')"
    if [[ -n "$existing" ]]; then
      info "release PR #$existing 已存在，更新內文"
      external "$target" gh pr edit "$existing" --title "$title" --body "$body"
    else
      external "$target" gh pr create --base main --head "$sync_branch" --title "$title" --body "$body"
    fi
    printf '\n'
    info "下一步：CI 通過後執行 finalize-release.sh --component $component --line $line --phase close，它會以 squash 合併該 PR"
    ;;

  close)
    # 收尾只讀 origin/main，不切到 main：main 常在另一個 worktree 被檢出，切換會失敗。試跑與正式執行
    # 走同一套核對，差別只在對外寫入是否執行。
    require_clean_tree
    run git fetch --prune --tags origin
    path="$(unit_path "$component")"
    if git rev-parse -q --verify "refs/remotes/origin/$branch" >/dev/null; then
      version="$(git show "origin/$branch:$MANIFEST" | jq -r --arg p "$path" '.[$p]')"
    else
      version="$(git show "origin/main:$MANIFEST" | jq -r --arg p "$path" '.[$p]')"
    fi
    [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "$component 的版號是「${version}」，不是 GA 版號；先完成 GA 與 merge-back"
    title="chore(release): $component v$version → main"

    # 1. 合併 release PR。合併訊息由這裡指定：GitHub 預設的 squash 訊息會在 PR 內文後面接上各 commit 的
    #    標題，Release-Train-Base 就不在最後一段，git 讀不成 trailer。
    pr="$(gh pr list --base main --head "$sync_branch" --state open --json number --jq '.[0].number // empty' 2>/dev/null || true)"
    if [[ -n "$pr" ]]; then
      body="$(gh pr view "$pr" --json body --jq .body)"
      log "以 squash 合併 release PR #${pr}，合併訊息為 PR 標題與內文，Release-Train-Base 在最後一行"
      external_retry "$target" gh pr merge "$pr" --squash --subject "$title (#$pr)" --body "$body"
      run git fetch --prune --tags origin
    fi
    if [[ -z "$(git log origin/main --format=%H --fixed-strings --grep="chore(release): $component v$version" -n 1)" ]]; then
      (( DRY_RUN )) && [[ -n "$pr" ]] && info "[dry-run] release PR #$pr 尚未合併，以下核對僅供參考" \
        || die "main 上找不到 release PR 合併後的 commit（先執行 merge-back，CI 通過後再執行 close）"
    fi

    # 2. main 帶著這次發布的起算點，也就是發布分支的 Release-Train-Base（本套件的那一行）。只找「任何一個」
    #    會被上一次發布的 trailer 騙過。PR 若被手動以預設訊息合併，補一個只帶 trailer 的空 commit。
    train_ref="origin/$branch"
    git rev-parse -q --verify "refs/remotes/$train_ref" >/dev/null || train_ref="$component/v$version"
    base="$(train_base_shas "$component" "$train_ref" | head -1)"
    [[ -n "$base" ]] || die "$train_ref 上讀不到 Release-Train-Base: $component <sha>，無法核對 main 的起算點"
    # 先存成字串再比對：pipefail 之下，grep -q 提早結束會讓 git log 收到 SIGPIPE，整條管線被判為失敗。
    main_has_base() { grep -qx "$component $base" <<<"$(git log origin/main -n 20 --format='%(trailers:key=Release-Train-Base,valueonly)')"; }
    if ! main_has_base; then
      log "main 讀不到這次的 Release-Train-Base ${component} ${base:0:7}，補一個只帶 trailer 的 commit"
      if (( DRY_RUN == 0 )); then
        fix="$(git commit-tree "origin/main^{tree}" -p origin/main \
          -m "chore(release): 記錄 $component v$version 的 Release-Train-Base" \
          -m "合回 main 的訊息裡讀不到這一行，這裡補上，讓下次切 train 找得到起算點。" \
          -m "Release-Train-Base: $component $base")"
        external "$target" git push origin "$fix:refs/heads/main"
        run git fetch origin
      else
        info "[dry-run] 補上 Release-Train-Base: $component $base"
      fi
    fi

    # 3. 套件 tag 由 release-please 在發布分支上建立，這裡只核對它存在於遠端，且樹裡的版號等於 manifest 版號。
    tag="$component/v$version"
    [[ -n "$(git ls-remote --tags origin "refs/tags/$tag")" ]] || die "遠端沒有 tag $tag（先合併 Release PR 並等 tag 建立）"

    # 4. 刪除發布分支與流程產生的暫時分支（不變式：兩次發布之間本套件 0 條）。本機分支正被檢出時先切離。
    #    release-please 的工作分支名是 release-please--branches--<target>--components--<component>，
    #    用前綴比對，只刪本套件的。
    log "刪除 ${component} 的 release 分支與暫時分支"
    while IFS= read -r extra; do
      [[ -n "$extra" ]] && external "$target" git push origin --delete "$extra"
    done < <(
      { git ls-remote --heads origin "refs/heads/$branch" "refs/heads/$sync_branch" "refs/heads/release-please--branches--${branch}*"; } \
        | sed -E 's#.*refs/heads/##' | sort -u)
    [[ "$(current_branch)" == "$branch" || "$(current_branch)" == "$sync_branch" ]] && run git switch -q --detach origin/main
    for local_branch in "$branch" "$sync_branch"; do
      git rev-parse -q --verify "refs/heads/$local_branch" >/dev/null && run git branch -D "$local_branch"
    done
    run git fetch --prune --tags origin

    # 5. 關閉核對，全部讀遠端與 origin/main。
    printf '\n'
    log "關閉核對清單"
    ok=1
    n="$(release_branches "$component" | grep -c . || true)"
    [[ "$n" == 0 ]] && info "✓ ${component} 的 release 分支數 = 0" || { info "✗ ${component} 仍有 release 分支：$(release_branches "$component")"; ok=0; }
    leftover="$(git ls-remote --heads origin "refs/heads/release-please--branches--release/${component}/*" | wc -l | tr -d ' ')"
    [[ "$leftover" == 0 ]] && info "✓ 無 ${component} 殘留的 release-please 工作分支" || { info "✗ 仍有 $leftover 條 ${component} 的 release-please 工作分支"; ok=0; }
    if git rev-parse -q --verify "refs/tags/$tag" >/dev/null; then
      [[ "$(git show "$tag:$path/package.json" | jq -r .version)" == "$version" ]] \
        && info "✓ ${tag}，樹裡的版號為 ${version}" || { info "✗ $tag 的樹裡版號不是 $version"; ok=0; }
    else
      info "✗ tag $tag 缺"; ok=0
    fi
    [[ "$(git show "origin/main:$MANIFEST" | jq -r --arg p "$path" '.[$p]')" == "$version" ]] \
      && info "✓ main 的 manifest：$path = $version" || { info "✗ main 的 manifest 的 $path ≠ $version"; ok=0; }
    # 步驟回報成功但實際沒生效的情形踩過多次，所以讀回 main 確認。
    main_has_base && info "✓ main 已帶這次的 Release-Train-Base ${component} ${base:0:7}" || { info "✗ main 上找不到這次的 Release-Train-Base ${component} ${base:0:7}，下一次發布會用錯起算點"; ok=0; }
    # 任一階段（alpha、beta、rc）的版號都帶 "-"，判斷 "-" 而不是某個階段名
    git show "origin/main:$MANIFEST" | jq -e 'any(.[]; test("-"))' >/dev/null && { info "✗ main manifest 仍含 prerelease 版號"; ok=0; } || info "✓ main manifest 無 prerelease 版號"
    git show "origin/main:$CONFIG" | jq -e '.versioning // empty' >/dev/null 2>&1 && { info "✗ main 的 $CONFIG 仍在 prerelease 模式"; ok=0; } || info "✓ main 設定為正式模式且涵蓋全部套件"
    if (( DRY_RUN )); then log "試跑完成：以上核對反映執行前的狀態"
    elif (( ok )); then log "verified：$branch 已關閉"
    else die "關閉核對未全過，補齊後重跑 --phase close"; fi
    ;;
  *) die "--phase 需為 ga|merge-back|close" ;;
esac
