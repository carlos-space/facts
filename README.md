# facts

工具對外定義的資料來源。一筆 fact 是由工具決定、使用者必須照著做或一定會遇到的事，例如指令、設定欄位、hook 事件與行為。提示詞、文件與測試都讀同一份 facts，實作照規格另外寫，由測試比對。

## 套件

| 套件             | 內容                                                                     | 發布到哪    |
| :--------------- | :----------------------------------------------------------------------- | :---------- |
| `fact-kit`       | fact 的型別與 meta-schema，以及撰寫、檢查、建置、讀取與比對 facts 的工具 | npm（公開） |
| `platform-facts` | 第三方工具的 facts，依平台分成子路徑，另含 fact-kit 自己的定義           | npm（公開） |

## 授權與非官方聲明

`fact-kit` 與 `platform-facts` 都以 MIT 授權發布。`platform-facts` 的轉換內容來自 SchemaStore 與 openai/codex（Apache-2.0）和 GitHub REST API 描述（MIT），著作權聲明在 `packages/platform-facts/NOTICE`。Claude Agent SDK 只取名稱與型別，不含說明文字。

本專案是非官方的，與 Anthropic、OpenAI、GitHub 沒有關係。Claude、Codex、OpenAI、GitHub 等名稱是各自所有者的商標。

## 發版

兩個套件各自發版，各有一條發布分支 `release/<套件>/vX.Y`，`<套件>` 是 `fact-kit` 或 `platform-facts`。每個套件同一時間最多一條，兩個套件可以同時各開一條。main 上不會出現 release-please 開的 commit。版號檔、CHANGELOG 與 manifest 在 GA 之後，隨 `release/<套件>/vX.Y--to-main` 這個 squash 合回 PR 進 main。

`--line X.Y` 是要發的版號的主次版號，用來命名分支，不決定版號。版號由 release-please 依 commit 算出，所以 `fact-kit` 0.4.0 要發 0.4.1 時用 `--line 0.4`，這條線上只放 `fix:` commit，放 `feat:` 會算出 0.5.0。這條線已經有 `<套件>/vX.Y.Z` tag 時，切分支必須帶 `--from <那個 tag>`。

預發布版的 npm dist-tag 等於階段名（`alpha`、`beta`、`rc`），只有 GA 進 `latest`，所以 `npm install` 不會裝到預發布版。腳本需要 bash 4 以上（macOS 用 `brew install bash`）、`gh`、`jq`，並且在乾淨的工作區執行。所有腳本都可以加 `--dry-run` 先看會做什麼，不寫遠端也不推送。

以下以 `fact-kit` 的 0.4 線為例。

1. 切分支，預設從 alpha 開始，推送後 release-please 在分支上開 Release PR。

   ```bash
   bash scripts/release/cut-release.sh --component fact-kit --line 0.4 [--stage alpha|beta|rc|ga] [--from fact-kit/v0.4.0]
   ```

2. 合併分支上的 Release PR。release-please 建立 tag `fact-kit/v0.4.1-alpha.1`，`publish.yml` 以 dist-tag `alpha` 發布到 npm。分支上再有 `fix:` commit 時，每次都再開一次 Release PR，序號加一。

3. 推進階段。順序是 alpha、beta、rc，可以跳過，不能往回。省略 `--to` 時推進到下一階段。每個階段的序號從 `.1` 開始，再重複第 2 步。

   ```bash
   bash scripts/release/advance-release.sh --component fact-kit --line 0.4 [--to beta|rc]
   ```

4. GA。腳本等分支最新 commit 的 ci 通過，寫入正式版號並離開預發布模式。合併分支上的 Release PR 後，tag 變成 `fact-kit/v0.4.1`，以 dist-tag `latest` 發布。

   ```bash
   bash scripts/release/advance-release.sh --component fact-kit --line 0.4 --to ga
   ```

5. 合回 main。腳本刪掉標記檔，在 main 之上建立 `release/fact-kit/v0.4--to-main` 並開 PR。等這個 PR 的 ci 通過。

   ```bash
   bash scripts/release/finalize-release.sh --component fact-kit --line 0.4 --phase merge-back
   ```

6. 收尾。腳本以 squash 合併上一步的 PR，刪掉 `fact-kit` 的發布分支與 release-please 暫時分支，並核對 main。

   ```bash
   bash scripts/release/finalize-release.sh --component fact-kit --line 0.4 --phase close
   ```

任何一步中途失敗，修好後重跑同一個指令。已經發到 npm 的版本會被略過。發布分支上的 hotfix 從 `hotfix/<issue>-<kebab>` 切出，PR 合回發布分支。

## 開發

```bash
pnpm install
pnpm check
pnpm build
pnpm test
```

PR 以 squash 合併，所以 PR 標題要符合 Conventional Commits。

一個變更同時改到 `packages/fact-kit` 與 `packages/platform-facts` 時，commit 訊息或 PR 內文的最後一段必須有 `Coupled-Change: <為什麼必須一起合>`。能拆開就拆成每個套件各一個 PR。`main` 上的 `scripts/hooks/commit-msg` 與 PR 的 `pr-message` workflow（job 名稱 `pr-title`）都會檢查，內文也不能帶 AI 平台署名。
