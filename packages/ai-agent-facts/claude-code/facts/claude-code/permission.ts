import { factsOf, observedDoc, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['permission'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/permissions.md', fetched: '2026-10-21' }),
})

export const permissionFacts = [
  mf.statement(
    'permission-rule-syntax',
    'permission 規則寫成 ToolName 或 ToolName(pattern)。Edit 與 Read 支援 ~/ 與 ** glob，Bash 支援指令前綴模式。優先序由高到低是 managed、command line、project local、shared project、user；同一層 deny 優先於 allow。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Permission rule syntax', hash: 'sha256:967e50dd504439a8' },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
    },
  ),
  mf.statement(
    'bash-rule-mixed-wildcard',
    'Bash 規則同時有中間的 `*` 與結尾的 `:*` 時，整條當成字面前綴，`*` 不展開，實際比對不到。中間有 `*`、結尾不加 `:*` 的規則照萬用字元比對整條指令，例如 `git push * --force *` 比對得到 `git push origin --force main`。`*` 也比對得到空字串，例如 `node *consistency.mjs *` 比對得到 `node consistency.mjs --dry-run`。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '三個臨時目錄的 .claude/settings.json 各放一條 deny：`Bash(git push * --force:*)`、`Bash(git push * --force *)`，以及對照用的 `Bash(git push --force:*)`。用 claude -p 要求原樣執行，前兩個目錄執行 `git push origin --force main`，第三個執行 `git push --force origin main`。成立的條件是第一條沒被 deny 擋下，後兩條的回應寫明被拒絕。空字串另用 --settings 帶入 `Bash(node:*)` allow 與 `Bash(node *consistency.mjs *)` ask，執行 `node consistency.mjs --dry-run` 與 `node other.mjs --dry-run`，成立的條件是前者要求核准、後者直接執行',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      note: '本機 headless，Claude Code 2.1.292，三個臨時目錄各放一條 deny，各跑一輪；同版本對混用的規則印出「will likely never match」警告。空字串另以 --settings 帶入 `Bash(node:*)` allow 與 `Bash(node *consistency.mjs *)` ask 跑一輪，`node consistency.mjs --dry-run` 要求核准，`node other.mjs --dry-run` 直接執行',
      source: observedSpike({ fetched: '2026-10-22' }),
    },
  ),
  mf.statement(
    'permission-mode-names',
    'permission 模式六種：default（標籤 Manual，僅讀取免問）、acceptEdits（另加檔案寫入與常見檔案系統指令）、plan（不改源碼，auto mode 可用時分類器核准的指令也會執行）、auto（由分類器審查多數動作）、dontAsk（會詢問的動作一律拒絕）、bypassPermissions（除了沒有模式會自動放行的動作以外都不詢問，deny 規則仍生效）。CLI 也接受 manual 作為 default 的別名。',
    {
      topics: ['mode'],
      verify: {
        probe: { kind: 'hash', anchor: 'as an alias wherever you type the value', hash: 'sha256:324fcd263f0af004' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/permission-modes.md', fetched: '2026-10-19' }),
    },
  ),
]
