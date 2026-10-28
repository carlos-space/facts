import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-desktop',
  topics: ['desktop'],
  source: { kind: 'observed', basis: 'measured', fetched: '2026-10-18' },
})

export const desktopFacts = [
  mf.statement(
    'desktop-bundled-claude',
    '桌面 app 內建自己的 Claude Code，放在 `~/Library/Application Support/Claude/claude-code/<版本>/<雜湊>/claude.app/Contents/MacOS/claude`，版本可能比終端機 PATH 上的 `claude` 新',
    {
      topics: ['version'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '列出 `~/Library/Application Support/Claude/claude-code/` 底下的版本目錄，對那個 claude 跑 `--version`，和 PATH 上的 `claude --version` 比對',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '本機，桌面 app 內建 2.1.299、終端機 `claude --version` 是 2.1.292',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-20' },
    },
  ),
  mf.statement('desktop-chat-unrendered-formats', '桌面 app 的聊天畫面不顯示摺疊區塊 `<details>` 與 mermaid 圖。', {
    topics: ['markdown'],
    verify: {
      probe: {
        kind: 'manual',
        reason: '在桌面 app 的聊天畫面送出一則含 <details> 與 mermaid 的回覆。成立的條件是兩種都顯示成原始標記或空白',
      },
      verifiedOn: '2.1.299',
      screenedThrough: '2.1.299',
    },
    note: '桌面 app 2.1.299，使用者看同一則含這些格式的回覆，n=1',
  }),
  mf.statement('desktop-chat-rendered-formats', '桌面 app 的聊天畫面照格式顯示任務清單、刪除線與 `diff` 程式碼區塊。', {
    topics: ['markdown'],
    verify: {
      probe: {
        kind: 'manual',
        reason:
          '在桌面 app 的聊天畫面送出一則含任務清單、刪除線與 diff 區塊的回覆。成立的條件是三種都照格式顯示，不是原始標記',
      },
      verifiedOn: '2.1.299',
      screenedThrough: '2.1.299',
    },
    note: '桌面 app 2.1.299，使用者看同一則含這些格式的回覆，n=1',
  }),
  mf.statement(
    'desktop-chat-code-actions',
    '桌面 app 在標了 shell 語言（例如 `bash`）的程式碼區塊加執行按鈕，工作目錄內以相對路徑寫的 `[檔名](路徑:行號)` 連結在檔案窗格點得開。',
    {
      topics: ['markdown'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在桌面 app 讀 Code 分頁給模型的說明。成立的條件是說明寫著 shell 標記的區塊會加 Run 按鈕，且工作目錄內的相對路徑連結在檔案窗格打得開',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '桌面 app 2.1.299 給模型的 Code 分頁說明',
      source: { kind: 'observed', basis: 'doc', fetched: '2026-10-18' },
    },
  ),
]
