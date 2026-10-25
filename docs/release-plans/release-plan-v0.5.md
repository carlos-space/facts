# Release Plan v0.5（product line v0.5）

- 狀態：draft
- 產品版號：`v0.5.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.5`
- 入版單元：platform-facts
- 階段路徑：從 beta 起步（`cut-release.sh --stage beta`），驗過 beta 再進 GA，不經 rc。發布目的地是 npm，beta 用 dist-tag `beta`，GA 進 `latest`

## Feature Inventory

這一版只含 #36：platform-facts 新增 `sparkle`、`apple-notarization`、`cloudflare-r2` 三個子路徑共 22 筆 fact，`github` 多一筆 `github.environment-secrets-free-private`。NotchHub 的發布流程要引用這些 fact。沒有對應的 Issue。

| Issue | 單元           | 狀態   | 批次 |
| :---- | :------------- | :----- | :--- |
| 無    | platform-facts | 規劃中 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。1.0 前 feat 升 minor。fact-kit 這一版沒有變更，不入版。

| 單元           | 路徑                    | 實作版號 | tag                    |
| :------------- | :---------------------- | :------- | :--------------------- |
| product        | package.json            | 0.5.0    | v0.5.0                 |
| platform-facts | packages/platform-facts | 0.10.0   | platform-facts/v0.10.0 |

beta 階段的版號是 `0.10.0-beta.1`。

## Breaking Changes

無。platform-facts 只新增 fact 與三個子路徑匯出，既有 341 筆不變，`fact-kit diff` 對 0.9.0 只有 23 筆 added。

## Rollback

- 可回退：npm 上已發布的版本原則上不撤回。把 `latest` 指回前一版用 `npm dist-tag add platform-facts@0.9.0 latest`，並對有問題的版本執行 `npm deprecate`。
- 不可回退：已推送的 tag 與已發布的 npm 版本。補救走修補發布，`release/v0.5` 從 `v0.5.0` 重建，指令是 `cut-release.sh --line 0.5 --from v0.5.0`。

## 變更記錄

- 0.5.0-beta：從 beta 起步
