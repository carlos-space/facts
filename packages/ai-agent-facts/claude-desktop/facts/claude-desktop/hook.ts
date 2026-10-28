import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-desktop',
  topics: ['hook'],
  source: { kind: 'observed', basis: 'measured', fetched: '2026-09-27' },
})

export const hookFacts = [
  mf.statement(
    'desktop-hook-display',
    '桌面 app 不顯示 Stop hook 的 systemMessage；UserPromptSubmit 的 sessionTitle 不改側欄標題，卻會改會話名稱，而且 hook 設在工作區時會改到其他會話。回覆裡自訂 scheme 的連結點不開，http 連結交給預設瀏覽器。MessageDisplay 每則訊息觸發一次，替換後的連結可以點。',
    {
      topics: ['desktop'],
      verify: {
        probe: {
          kind: 'manual',
          reason: '桌面 app 行為需手動操作環境重測，無法透過文件或腳本自動抓取。重測時在桌面 app 內建的那一版做',
        },
        verifiedOn: '2.1.281',
        screenedThrough: '2.1.284',
      },
      note: '桌面 app，Claude Code 2.1.281',
    },
  ),
]
