# facts

facts 是產品定義與規格的單一來源，記錄每個版本是什麼、做什麼、接受什麼。本倉庫放外部工具與平台的 facts。一筆 fact 是由工具決定、使用者必須照著做或一定會遇到的事，例如指令、設定欄位、hook 事件與行為。

文件、測試與提示詞都讀同一份 facts。實作照規格另外寫，不讀 facts，由測試比對兩者。facts 不含實作方法與決策理由，這兩樣寫在決策文件。

## 套件

| 套件                 | 內容                                                                                                | 發布到哪    |
| :------------------- | :-------------------------------------------------------------------------------------------------- | :---------- |
| `ai-agent-facts`     | AI agent 產品的 facts（claude-code、claude-desktop、codex）                                         | npm（公開） |
| `os-facts`           | 作業系統的 facts（目前還沒有 component）                                                            | npm（公開） |
| `devtool-facts`      | 開發工具的 facts（gfm、gh、git、pnpm、release-please、semver、typescript、wrangler）                | npm（公開） |
| `distribution-facts` | 發行與上架管道的 facts（app-store、apple-notarization、crates-io、google-play、npm、pypi、sparkle） | npm（公開） |
| `service-facts`      | 雲端服務的 facts（cloudflare-r2、github、github-actions）                                           | npm（公開） |

本倉庫發布這 5 個匯總套件。每個匯總套件把所屬 component 的 facts 放在子路徑 `<匯總套件>/<component>`，例如 `readFacts('ai-agent-facts/claude-code')`。component 套件放在 `packages/<匯總套件>/<component>/`，名稱是 `<component>-facts`，是 `private: true` 的工作區套件，不發布，只用來撰寫與建置。撰寫、檢查、建置、讀取與比對 facts 的工具由 npm 的 `fact-kit` 套件提供（原始碼在倉庫 carlos-space/fact-kit），各套件以它建置。fact-kit 自己的 facts 由 npm 的 `fact-kit-facts` 提供。

拆分前的 `platform-facts` 已不在本倉庫。下面兩張表說明每個 component 在哪個匯總套件，以及有哪些 fact 的 id 改了名。

## Component 對照表

| component            | 所屬匯總套件         | 子路徑                                  | 拆分前在 platform-facts 的平台 |
| :------------------- | :------------------- | :-------------------------------------- | :----------------------------- |
| `app-store`          | `distribution-facts` | `distribution-facts/app-store`          | app-store                      |
| `apple-notarization` | `distribution-facts` | `distribution-facts/apple-notarization` | apple-notarization             |
| `claude-code`        | `ai-agent-facts`     | `ai-agent-facts/claude-code`            | claude-code                    |
| `claude-desktop`     | `ai-agent-facts`     | `ai-agent-facts/claude-desktop`         | claude-desktop                 |
| `cloudflare-r2`      | `service-facts`      | `service-facts/cloudflare-r2`           | cloudflare-r2                  |
| `codex`              | `ai-agent-facts`     | `ai-agent-facts/codex`                  | codex                          |
| `crates-io`          | `distribution-facts` | `distribution-facts/crates-io`          | crates-io                      |
| `gfm`                | `devtool-facts`      | `devtool-facts/gfm`                     | github                         |
| `gh`                 | `devtool-facts`      | `devtool-facts/gh`                      | github                         |
| `git`                | `devtool-facts`      | `devtool-facts/git`                     | git                            |
| `github`             | `service-facts`      | `service-facts/github`                  | github                         |
| `github-actions`     | `service-facts`      | `service-facts/github-actions`          | github                         |
| `google-play`        | `distribution-facts` | `distribution-facts/google-play`        | google-play                    |
| `npm`                | `distribution-facts` | `distribution-facts/npm`                | npm                            |
| `pnpm`               | `devtool-facts`      | `devtool-facts/pnpm`                    | pnpm                           |
| `pypi`               | `distribution-facts` | `distribution-facts/pypi`               | pypi                           |
| `release-please`     | `devtool-facts`      | `devtool-facts/release-please`          | release-please                 |
| `semver`             | `devtool-facts`      | `devtool-facts/semver`                  | npm、pnpm                      |
| `sparkle`            | `distribution-facts` | `distribution-facts/sparkle`            | sparkle                        |
| `typescript`         | `devtool-facts`      | `devtool-facts/typescript`              | typescript                     |
| `wrangler`           | `devtool-facts`      | `devtool-facts/wrangler`                | cloudflare-r2                  |

## 舊 id 對照表

拆分時 `platform-facts` 的 360 筆 fact 有 21 筆的 id 改了名（前綴換成新 component，`tool` 欄跟著換），其餘 id 不變。改名的對照如下。

| 舊 id                                         | 新 id                                             |
| :-------------------------------------------- | :------------------------------------------------ |
| `cloudflare-r2.wrangler-auth-env`             | `wrangler.auth-env`                               |
| `cloudflare-r2.wrangler-object-local-default` | `wrangler.object-local-default`                   |
| `github.gh-api-default-method`                | `gh.api-default-method`                           |
| `github.gh-pr-subcommands`                    | `gh.pr-subcommands`                               |
| `github.default-token-events`                 | `github-actions.default-token-events`             |
| `github.tag-triggered-workflow`               | `github-actions.tag-triggered-workflow`           |
| `github.environment-plan-limit`               | `github-actions.environment-plan-limit`           |
| `github.environment-secrets-free-private`     | `github-actions.environment-secrets-free-private` |
| `github.environment-tag-rule`                 | `github-actions.environment-tag-rule`             |
| `github.token-permissions-default`            | `github-actions.token-permissions-default`        |
| `github.token-permissions-key`                | `github-actions.token-permissions-key`            |
| `github.action-sha-pinning`                   | `github-actions.action-sha-pinning`               |
| `github.checkout-persist-credentials`         | `github-actions.checkout-persist-credentials`     |
| `github.checkout-credentials-location`        | `github-actions.checkout-credentials-location`    |
| `github.job-timeout-default`                  | `github-actions.job-timeout-default`              |
| `github.concurrency-group`                    | `github-actions.concurrency-group`                |
| `github.oidc-workflow-ref`                    | `github-actions.oidc-workflow-ref`                |
| `github.gfm-strikethrough`                    | `gfm.strikethrough`                               |
| `github.workflow-syntax`                      | `github-actions.workflow-syntax`                  |
| `npm.semver-identifier-base`                  | `semver.identifier-base`                          |
| `pnpm.semver-caret-zero`                      | `semver.caret-zero`                               |

## 授權與非官方聲明

5 個匯總套件都以 MIT 授權發布。轉換內容來自 SchemaStore 與 openai/codex（Apache-2.0）和 GitHub REST API 描述（MIT），帶這些內容的套件另附 `LICENSE-APACHE-2.0` 與 `NOTICE`，著作權聲明在 `packages/ai-agent-facts/NOTICE`、`packages/devtool-facts/NOTICE` 與 `packages/service-facts/NOTICE`。`distribution-facts` 與 `os-facts` 沒有這類內容，不帶這兩個檔。Claude Agent SDK 只取名稱與型別，不含說明文字。

本專案是非官方的，與 Anthropic、OpenAI、GitHub 沒有關係。Claude、Codex、OpenAI、GitHub 等名稱是各自所有者的商標。

## 發版

整個倉庫同一時間最多一條發布分支 `release/vX.Y`（train），用 `--units` 選要入版的套件。入版的套件各自有版號和 tag `<套件>/vX.Y.Z`，每次發布另外指派一個產品版號 `vX.Y.Z`，記在 root `package.json` 的 `version`。main 只收 PR，上面不會出現 release-please 開的 commit。版號檔、CHANGELOG、manifest 與產品版號在 GA 之後，隨 `release/vX.Y--to-main` 這個 squash 合回 PR 進 main。

`--line X.Y` 是產品線，用來命名分支，不決定套件版號。套件版號由 release-please 依 commit 算出，這條線上只放 `fix:` commit 時套件只升 patch，放 `feat:` 會升 minor。產品版號由 `--product-version` 指定，每次發布必填，並寫在 `docs/release-plans/release-plan-vX.Y.md`。這條線已經有產品 tag `vX.Y.Z` 時，切分支必須帶 `--from <最新的產品 tag>`。

預發布版的 npm dist-tag 等於階段名（`alpha`、`beta`、`rc`），只有 GA 進 `latest`，所以 `npm install` 不會裝到預發布版。腳本需要 bash 4 以上（macOS 用 `brew install bash`）、`gh`、`jq`，並且在乾淨的工作區執行。所有腳本都可以加 `--dry-run` 先看會做什麼，不寫遠端也不推送。

以下以產品線 0.1、產品版號 0.1.0 為例。

1. 在 `docs/release-plans/release-plan-v0.1.md` 寫 Release Plan，指派產品版號並列出入版的套件。

2. 切分支，預設從 alpha 開始。`--units` 是入版的套件，用逗號分隔，沒有 commit 的套件不會發版。腳本會把相依的套件一併納入。推送後 release-please 在分支上開 Release PR。

   ```bash
   bash scripts/release/cut-release.sh --line 0.1 --units ai-agent-facts,devtool-facts [--stage alpha|beta|rc|ga] [--from v0.1.0]
   ```

3. 合併分支上的 Release PR。release-please 為每個入版的套件建立 tag，例如 `ai-agent-facts/v0.4.2-alpha.1`，`publish.yml` 以 dist-tag `alpha` 發布到 npm。分支上再有 `fix:` commit 時，每次都再開一次 Release PR，序號加一。

4. 推進階段。順序是 alpha、beta、rc，可以跳過，不能往回。省略 `--to` 時推進到下一階段。每個階段的序號從 `.1` 開始，再重複第 3 步。

   ```bash
   bash scripts/release/advance-release.sh --line 0.1 [--to beta|rc]
   ```

5. GA。`--to ga` 必須帶 `--product-version`。腳本等分支最新 commit 的 ci 通過，寫入各套件的正式版號並離開預發布模式。合併分支上的 Release PR 後，tag 變成 `ai-agent-facts/v0.4.2`，以 dist-tag `latest` 發布。

   ```bash
   bash scripts/release/advance-release.sh --line 0.1 --to ga --product-version 0.1.0
   ```

6. 合回 main。腳本刪掉標記檔，把產品版號寫進發布分支的 root `package.json`，在 main 之上建立 `release/v0.1--to-main` 並開 PR，PR 內文附 Snapshot。等這個 PR 的 ci 通過。

   ```bash
   bash scripts/release/finalize-release.sh --line 0.1 --phase merge-back --product-version 0.1.0
   ```

7. 收尾。腳本以 squash 合併上一步的 PR，在發布分支的最後一個 commit 打產品 tag `v0.1.0`，刪掉發布分支與 release-please 暫時分支，並核對 main。產品 tag 會觸發 `release-line-finalize.yml`，核對各套件 tag 並建立附 Snapshot 的 GitHub Release。

   ```bash
   bash scripts/release/finalize-release.sh --line 0.1 --phase close --product-version 0.1.0
   ```

任何一步中途失敗，修好後重跑同一個指令。已經發到 npm 的版本會被略過。發布分支上的 hotfix 從 `hotfix/<issue>-<kebab>` 切出，PR 合回發布分支。已發布的產品線要修補時，用 `cut-release.sh --line 0.1 --units <套件> --from v0.1.0` 自產品 tag 重建。

## 開發

```bash
pnpm install
pnpm check
pnpm build
pnpm test
```

main 只收 PR，以 squash 合併，所以 PR 標題要符合 Conventional Commits，PR 內文就是 main 上的 commit 內文。本機不裝 git hook，規則都由 PR 的 workflow 檢查。

一個變更同時改到 `.release-please-manifest.json` 列出的兩個以上發布單元時（目前有 5 個匯總套件，所以同一個 PR 改到其中兩個以上就會觸發），commit 訊息或 PR 內文的最後一段必須有 `Coupled-Change: <為什麼必須一起合>`。能拆開就拆成每個套件各一個 PR。PR 的 `pr-message` workflow（job 名稱 `pr-title`）會檢查這一點，內文也不能帶 AI 平台署名。
