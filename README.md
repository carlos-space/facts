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

## 開發

```bash
pnpm install
pnpm check
pnpm build
pnpm test
```

PR 以 squash 合併，所以 PR 標題要符合 Conventional Commits。
