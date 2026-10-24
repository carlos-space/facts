# Release Plan v0.1（product line v0.1）

- 狀態：draft
- 產品版號：`v0.1.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.1`；入版單元：fact-kit、platform-facts
- 階段路徑：從 alpha 起步，依序推進 beta、rc 後 GA（`cut-release.sh --stage alpha`、`advance-release.sh --to`）。發布目的地是 npm，階段名就是 dist-tag，GA 進 `latest`

## Feature Inventory

切 train 時依實際進版的 Issue 補上，一個 Issue 一列。

| Issue    | 單元                     | 狀態   | 批次 |
| :------- | :----------------------- | :----- | :--- |
| （待填） | fact-kit、platform-facts | 規劃中 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。

| 單元           | 路徑                    | 實作版號 | tag                   |
| :------------- | :---------------------- | :------- | :-------------------- |
| product        | package.json            | 0.1.0    | v0.1.0                |
| fact-kit       | packages/fact-kit       | 0.4.2    | fact-kit/v0.4.2       |
| platform-facts | packages/platform-facts | 0.6.1    | platform-facts/v0.6.1 |

## Breaking Changes

待確認：切 train 時依入版的 commit 補上，沒有就寫「無」。

## Rollback

- 可回退：npm 上已發布的版本不能撤回。把 `latest` 指回前一版用 `npm dist-tag add <套件>@<前一版> latest`，並對有問題的版本執行 `npm deprecate`。
- 不可回退：已推送的 tag 與已發布的 npm 版本；補救走修補發布（`release/v0.1` 從 `v0.1.0` 重建，`cut-release.sh --line 0.1 --from v0.1.0`）。

## 變更記錄

- 0.1.0-alpha：切 train
