# Release Plan v0.6（product line v0.6）

- 狀態：draft
- 產品版號：`v0.6.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.6`
- 入版單元：platform-facts
- 階段路徑：直接從 GA 起步（`cut-release.sh --stage ga`），不經 alpha、beta、rc。發布目的地是 npm，GA 進 `latest`

## Feature Inventory

這一版沒有功能改動，也沒有對應的 Issue。platform-facts 的內容不變，版號重設為 0.1.0，和產品版號分開起算。版號由 main 上的 `Release-As: 0.1.0` commit footer 指定，release-please 直接採用，不經版本策略。

| Issue | 單元           | 狀態   | 批次 |
| :---- | :------------- | :----- | :--- |
| 無    | platform-facts | 規劃中 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。fact-kit 這一版沒有變更，不入版。

| 單元           | 路徑                    | 實作版號 | tag                   |
| :------------- | :---------------------- | :------- | :-------------------- |
| product        | package.json            | 0.6.0    | v0.6.0                |
| platform-facts | packages/platform-facts | 0.1.0    | platform-facts/v0.1.0 |

## Breaking Changes

無。fact 的內容與 id 不變。platform-facts 的版號從 0.10.0 變成 0.1.0，依賴它的專案要把版號範圍改成 0.1.0。

## Rollback

- 可回退：npm 上已發布的版本原則上不撤回。有問題的版本用 `npm deprecate` 標記，修正走修補發布。
- 不可回退：已推送的 tag 與已發布的 npm 版本。補救走修補發布，`release/v0.6` 從 `v0.6.0` 重建，指令是 `cut-release.sh --line 0.6 --from v0.6.0`。

## 變更記錄

- 0.6.0：從 GA 起步
