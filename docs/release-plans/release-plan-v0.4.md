# Release Plan v0.4（product line v0.4）

- 狀態：draft
- 產品版號：`v0.4.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.4`；入版單元：fact-kit、platform-facts
- 階段路徑：直接從 GA 起步（`cut-release.sh --stage ga`），不經 alpha、beta、rc。發布目的地是 npm，GA 進 `latest`

## Feature Inventory

這一版只含 #32：fact-kit 新增 `valueListToMarkdown` 與 `replaceFactBlocks`，用來渲染值清單並替換文件區塊。platform-facts 補上這兩筆匯出的 fact。沒有對應的 Issue。

| Issue | 單元                     | 狀態   | 批次 |
| :---- | :----------------------- | :----- | :--- |
| 無    | fact-kit、platform-facts | 規劃中 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。1.0 前 feat 升 minor。

| 單元           | 路徑                    | 實作版號 | tag                   |
| :------------- | :---------------------- | :------- | :-------------------- |
| product        | package.json            | 0.4.0    | v0.4.0                |
| fact-kit       | packages/fact-kit       | 0.6.0    | fact-kit/v0.6.0       |
| platform-facts | packages/platform-facts | 0.9.0    | platform-facts/v0.9.0 |

## Breaking Changes

無。fact-kit 只新增匯出，既有匯出不變。platform-facts 只多出兩筆 fact，既有 fact 不變。

## Rollback

- 可回退：npm 上已發布的版本原則上不撤回。把 `latest` 指回前一版用 `npm dist-tag add fact-kit@0.5.0 latest` 與 `npm dist-tag add platform-facts@0.8.1 latest`，並對有問題的版本執行 `npm deprecate`。
- 不可回退：已推送的 tag 與已發布的 npm 版本；補救走修補發布（`release/v0.4` 從 `v0.4.0` 重建，`cut-release.sh --line 0.4 --from v0.4.0`）。

## 變更記錄

- 0.4.0：直接 GA
