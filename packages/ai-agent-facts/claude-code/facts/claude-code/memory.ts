import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['memory'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/memory.md', fetched: '2026-10-20' }),
})

export const memoryFacts = [
  mf.statement(
    'claude-md-session-load',
    '工作目錄以上各層的 CLAUDE.md 在每個 session 啟動時載入 context；子目錄的 CLAUDE.md 不在啟動時載入，要到 Claude 讀取、寫入或編輯該子目錄的其他檔案時才載入，用算作讀取的 Bash 指令（例如 cat、head）檢視單一檔案也算讀取。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'loads each one once Claude reads, writes, or edits another file in that subdirectory',
          hash: 'sha256:9e1a11bf700ae242',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
    },
  ),
  mf.value(
    'memory-paths',
    {
      managed: [
        '/Library/Application Support/ClaudeCode/CLAUDE.md',
        '/etc/claude-code/CLAUDE.md',
        '%ProgramFiles%\\ClaudeCode\\CLAUDE.md',
      ],
      user: ['~/.claude/CLAUDE.md'],
      project: ['./CLAUDE.md', './.claude/CLAUDE.md', './CLAUDE.local.md'],
    },
    {
      title: 'CLAUDE.md 記憶檔的位置',
      topics: ['paths'],
      description:
        '依載入順序由廣到窄。工作目錄以上各層的 CLAUDE.md 與 CLAUDE.local.md 啟動時載入，子資料夾裡的在 Claude 讀寫該資料夾的檔案時才載入。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'CLAUDE.md files can live in several locations, each with a different scope',
          hash: 'sha256:df9c39c738c42097',
        },
        verifiedOn: '2.1.308',
      },
      source: { kind: 'observed', basis: 'doc', url: 'https://code.claude.com/docs/en/memory.md' },
    },
  ),
]
