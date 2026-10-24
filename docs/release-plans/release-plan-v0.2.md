# Release Plan v0.2（product line v0.2）

- 狀態：draft
- 產品版號：`v0.2.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.2`；入版單元：platform-facts
- 階段路徑：直接從 GA 起步（`cut-release.sh --stage ga`），不經 alpha、beta、rc。發布目的地是 npm，GA 進 `latest`

## Feature Inventory

這一版只新增 platform-facts 的 claude-code 子路徑三筆 observed fact（OTel 內容開關、metrics 屬性開關、metrics 匯出器），沒有對應的 Issue。fact-kit 沒有改動，不入版。

| Issue | 單元           | 狀態   | 批次 |
| :---- | :------------- | :----- | :--- |
| 無    | platform-facts | 規劃中 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。

| 單元           | 路徑                    | 實作版號 | tag                   |
| :------------- | :---------------------- | :------- | :-------------------- |
| product        | package.json            | 0.2.0    | v0.2.0                |
| platform-facts | packages/platform-facts | 0.7.0    | platform-facts/v0.7.0 |

## Breaking Changes

無。只新增 fact id，沒有移除或改動既有 fact。`fact-kit diff` 對照 platform-facts 0.6.1 的 claude-code 子路徑，結果只有三筆 added。

## Rollback

- 可回退：npm 上已發布的版本原則上不撤回。把 `latest` 指回前一版用 `npm dist-tag add platform-facts@0.6.1 latest`，並對有問題的版本執行 `npm deprecate`。
- 不可回退：已推送的 tag 與已發布的 npm 版本；補救走修補發布（`release/v0.2` 從 `v0.2.0` 重建，`cut-release.sh --line 0.2 --from v0.2.0`）。

## 變更記錄

- 0.2.0：直接 GA
