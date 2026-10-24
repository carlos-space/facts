# Release Plan v0.3（product line v0.3）

- 狀態：draft
- 產品版號：`v0.3.0`（本 plan 是版號的唯一指派點）
- Milestone：無
- train 分支：`release/v0.3`；入版單元：fact-kit、platform-facts
- 階段路徑：直接從 GA 起步（`cut-release.sh --stage ga`），不經 alpha、beta、rc。發布目的地是 npm，GA 進 `latest`

## Feature Inventory

這一版只含 #25：fact-kit 的 observed source 新增選填的 `fetched` 與 `note`，platform-facts 同步規格並替 169 筆觀察事實回填。沒有對應的 Issue。

| Issue | 單元                     | 狀態   | 批次 |
| :---- | :----------------------- | :----- | :--- |
| 無    | fact-kit、platform-facts | 規劃中 | 1    |

## Snapshot 對照（GA 當下由 `pnpm snapshot --check-tags` 產出後貼入）

目前是計畫值，GA 前以腳本輸出為準。1.0 前 feat 升 minor。

| 單元           | 路徑                    | 實作版號 | tag                   |
| :------------- | :---------------------- | :------- | :-------------------- |
| product        | package.json            | 0.3.0    | v0.3.0                |
| fact-kit       | packages/fact-kit       | 0.5.0    | fact-kit/v0.5.0       |
| platform-facts | packages/platform-facts | 0.8.0    | platform-facts/v0.8.0 |

## Breaking Changes

無。新增的 `fetched`、`note` 都是選填，沒有這兩個欄位的舊格式 fact 照樣通過 check 與 readFacts。已發布的 index.json 只多出 source.fetched 與 source.note，既有欄位不變。

## Rollback

- 可回退：npm 上已發布的版本原則上不撤回。把 `latest` 指回前一版用 `npm dist-tag add fact-kit@0.4.2 latest` 與 `npm dist-tag add @carlos-space/platform-facts@0.7.0 latest`，並對有問題的版本執行 `npm deprecate`。
- 不可回退：已推送的 tag 與已發布的 npm 版本；補救走修補發布（`release/v0.3` 從 `v0.3.0` 重建，`cut-release.sh --line 0.3 --from v0.3.0`）。

## 變更記錄

- 0.3.0：直接 GA
- 0.3.1（修補，platform-facts 0.8.1）：0.8.0 漏了 `claude-code.otel-content-switches`、`claude-code.otel-metrics-attribute-switches`、`claude-code.otel-metrics-exporter` 三筆 fact，補回並加上擋 id 消失的測試。從 `v0.3.0` 重建 `release/v0.3`，只含 platform-facts
