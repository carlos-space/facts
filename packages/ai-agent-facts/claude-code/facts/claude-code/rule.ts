import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['rule'],
  source: { kind: 'observed', basis: 'doc', url: 'https://code.claude.com/docs/en/memory.md' },
})

export const ruleFacts = [
  mf.statement(
    'rule-scoped-loading',
    'rule 沒有 paths 時在啟動時載入；有 paths 時，在 Claude 用 Read、Write 或 Edit 工具處理命中 paths 的檔案時才載入，用算作讀取的 Bash 指令（例如 cat、head）檢視單一命中檔案也算，不是每次工具使用都觸發。',
    {
      topics: ['memory'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'A path-scoped rule loads when Claude uses the Read, Write, or Edit tool',
          hash: 'sha256:532c6604695f98c3',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/memory.md', fetched: '2026-10-20' }),
    },
  ),
  mf.value(
    'rule-paths',
    { user: ['~/.claude/rules/**/*.md'], project: ['.claude/rules/**/*.md'] },
    {
      title: 'rule 檔案的位置',
      topics: ['paths'],
      description: '`.md` 檔會遞迴掃描子資料夾。rule 沒有 managed 層與 plugin 層。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'you can organize instructions into multiple files using the',
          hash: 'sha256:ac676b1a3f695f85',
        },
        verifiedOn: '2.1.308',
      },
    },
  ),
  mf.schema(
    'rule-frontmatter',
    {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'rule frontmatter',
      type: 'object',
      properties: {
        paths: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: '限定 rule 生效檔案的 glob，YAML 清單或逗號分隔字串。',
        },
      },
    },
    {
      title: 'rule 檔案 frontmatter 欄位',
      topics: ['frontmatter'],
      description: 'rule 只讀 `paths`，其他欄位不報錯地忽略。frontmatter 在載入進上下文前會被移除。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'is the only field Claude Code reads from a rule',
          hash: 'sha256:d74824d268a62bdc',
        },
        verifiedOn: '2.1.308',
      },
    },
  ),
]
