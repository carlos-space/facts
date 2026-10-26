# Release Plan v0.7（product line v0.7）

- 狀態：draft
- 產品版號：`v0.7.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.7`
- 入版單元：platform-facts
- 階段路徑：直接從 GA 起步（`cut-release.sh --stage ga`），不經 alpha、beta、rc。發布目的地是 npm，GA 進 `latest`

## Feature Inventory

這一版新增 release-please 的 6 筆觀察來源 fact，id 是 `release-please.package-level-overrides`、`release-please.config-unknown-keys`、`release-please.linked-versions-max-version`、`release-please.node-workspace-direction`、`release-please.default-strategy-prerelease-version`、`release-please.prerelease-flag-github-release`。沒有對應的 Issue。

| Issue     | 單元           | 狀態 | 批次 |
| :-------- | :------------- | :--- | :--- |
| 無（#45） | platform-facts | 完成 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。platform-facts 的版號由 release-please 依 commit 計算，`feat` 在 1.0 之前預期升 minor。fact-kit 這一版沒有變更，不入版。

| 單元           | 路徑                    | 實作版號 | tag                   |
| :------------- | :---------------------- | :------- | :-------------------- |
| product        | package.json            | 0.7.0    | v0.7.0                |
| platform-facts | packages/platform-facts | 0.2.0    | platform-facts/v0.2.0 |

## Breaking Changes

無。只新增 fact，既有 fact 的內容與 id 不變。

## Rollback

- 可回退：npm 上已發布的版本原則上不撤回。有問題的版本用 `npm deprecate` 標記，修正走修補發布。
- 不可回退：已推送的 tag 與已發布的 npm 版本。補救走修補發布，`release/v0.7` 從 `v0.7.0` 重建，指令是 `cut-release.sh --line 0.7 --from v0.7.0`。

## 變更記錄

- 0.7.0：從 GA 起步
