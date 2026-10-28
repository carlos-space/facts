# Release Plan v0.1（product line v0.1）

- 狀態：draft
- 產品版號：`v0.1.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.1`
- 入版單元：ai-agent-facts、os-facts、devtool-facts、distribution-facts、service-facts
- 階段路徑：直接從 GA 起步（`cut-release.sh --stage ga`），不經 alpha、beta、rc。5 個單元在 `release-policy.json` 的 `stages` 都只有 `ga`。發布目的地是 npm，GA 進 `latest`

## Feature Inventory

5 個匯總套件的第一次發布。每個 component 是匯總套件底下的子目錄，以 `<套件>/<component>/index.json` 子路徑匯出。各 component 所在的匯總套件見 README 的「Component 對照表」。

| Issue | 單元               | 狀態 | 批次 |
| :---- | :----------------- | :--- | :--- |
| 無    | ai-agent-facts     | 完成 | 1    |
| 無    | os-facts           | 完成 | 1    |
| 無    | devtool-facts      | 完成 | 1    |
| 無    | distribution-facts | 完成 | 1    |
| 無    | service-facts      | 完成 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。5 個單元都沒發布過，release-please 以 `initial-version` 0.1.0 起算。

| 單元               | 路徑                        | 實作版號 | tag                       |
| :----------------- | :-------------------------- | :------- | :------------------------ |
| product            | package.json                | 0.1.0    | v0.1.0                    |
| ai-agent-facts     | packages/ai-agent-facts     | 0.1.0    | ai-agent-facts/v0.1.0     |
| os-facts           | packages/os-facts           | 0.1.0    | os-facts/v0.1.0           |
| devtool-facts      | packages/devtool-facts      | 0.1.0    | devtool-facts/v0.1.0      |
| distribution-facts | packages/distribution-facts | 0.1.0    | distribution-facts/v0.1.0 |
| service-facts      | packages/service-facts      | 0.1.0    | service-facts/v0.1.0      |

## Breaking Changes

5 個都是新套件，沒有前一版可以相容。原本的 platform-facts 不再發新版，舊 id 改成的新 id 見 README 的「舊 id 對照表」。

## v0.1.1（維護型）

- 產品版號：`v0.1.1`，從 `v0.1.0` 重建 `release/v0.1`，以 `cut-release.sh --line 0.1 --units devtool-facts,service-facts,ai-agent-facts --from v0.1.0 --stage ga` 開線，修正用 `git cherry-pick -x` 帶入
- 入版單元：ai-agent-facts、devtool-facts、service-facts，從 GA 起步，發到 npm 的 `latest`

| PR  | 單元           | 單元版號 | 內容                                                          |
| :-- | :------------- | :------- | :------------------------------------------------------------ |
| #58 | ai-agent-facts | 0.1.1    | 重驗三筆 hook fact，event-cadence 補 EndConversation 例外     |
| #59 | devtool-facts  | 0.2.0    | 補 release-please 觸發發版的 commit 類型                      |
| #60 | service-facts  | 0.2.0    | 補 GitHub Packages npm 的套件名、可見度、發布權限與跨倉庫授權 |

- 破壞性變更：無。devtool-facts、service-facts 只新增 fact，但 0.x 的 `feat` 升 minor，依賴 `^0.1.0` 的消費者要改依賴範圍才拿得到 0.2.0
- 退法：同下方 Rollback，修補從 `v0.1.1` 重建

## v0.1.2（維護型）

- 產品版號：`v0.1.2`，從 `v0.1.1` 重建 `release/v0.1`，以 `cut-release.sh --line 0.1 --units devtool-facts --from v0.1.1 --stage ga` 開線，修正用 `git cherry-pick -x` 帶入
- 入版單元：devtool-facts，從 GA 起步，發到 npm 的 `latest`

| PR  | 單元          | 單元版號 | 內容                                                |
| :-- | :------------ | :------- | :-------------------------------------------------- |
| #63 | devtool-facts | 0.3.0    | 補 release-please 發版 PR 分支被強制覆寫的實測 fact |

- 破壞性變更：無。只新增 fact，但 0.x 的 `feat` 升 minor，依賴 `^0.2.0` 的消費者要改依賴範圍才拿得到 0.3.0
- 退法：同下方 Rollback，修補從 `v0.1.2` 重建

## Rollback

- 可回退：npm 上已發布的版本原則上不撤回。有問題的版本用 `npm deprecate` 標記，修正走修補發布。
- 不可回退：已推送的 tag 與已發布的 npm 版本。補救走修補發布，`release/v0.1` 從 `v0.1.0` 重建，指令是 `cut-release.sh --line 0.1 --units <單元> --from v0.1.0`。

## 變更記錄

- 0.1.0：從 GA 起步
- 0.1.1：維護型，ai-agent-facts 0.1.1、devtool-facts 0.2.0、service-facts 0.2.0
- 0.1.2：維護型，devtool-facts 0.3.0
