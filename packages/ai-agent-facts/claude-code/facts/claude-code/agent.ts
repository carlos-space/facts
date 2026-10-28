import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['agent'],
  source: { kind: 'observed', basis: 'doc', url: 'https://code.claude.com/docs/en/sub-agents.md' },
})

export const agentFacts = [
  mf.value(
    'agent-paths',
    { user: ['~/.claude/agents/{name}.md'], project: ['.claude/agents/{name}.md'], plugin: ['agents/{name}.md'] },
    {
      title: 'subagent 檔案的位置',
      topics: ['paths'],
      description:
        '每個 subagent 是一個 Markdown 檔，會遞迴掃描子資料夾，檔名不必等於 `name`。managed 層由 managed settings 部署，文件沒寫檔案路徑，所以不列。plugin 的路徑相對於 plugin 根目錄。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Store subagent files in different locations depending on scope',
          hash: 'sha256:51d739458a9feaa4',
        },
        verifiedOn: '2.1.308',
      },
    },
  ),
  mf.schema(
    'agent-frontmatter',
    {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'subagent frontmatter',
      type: 'object',
      required: ['name', 'description'],
      properties: {
        name: { type: 'string', maxLength: 256, pattern: '^[^:]+$', description: '唯一識別名稱，不可含 `:`。' },
        description: { type: 'string', description: 'Claude 何時該委派給這個 subagent。' },
        tools: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: 'subagent 可用的工具，省略時繼承全部。',
        },
        disallowedTools: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: '要拒絕的工具。',
        },
        model: { type: 'string', description: '`sonnet`、`opus`、`haiku`、`fable`、完整模型 ID 或 `inherit`。' },
        permissionMode: { enum: ['default', 'acceptEdits', 'auto', 'dontAsk', 'bypassPermissions', 'plan', 'manual'] },
        maxTurns: { type: 'integer', minimum: 1 },
        autoCompactWindow: { type: 'integer', minimum: 100000, maximum: 1000000 },
        skills: { type: 'array', items: { type: 'string' }, description: '啟動時預載的 skills。' },
        mcpServers: { type: 'array', description: '已設定的 server 名稱，或以 server 名稱為鍵的內嵌定義。' },
        hooks: { type: 'object' },
        memory: { enum: ['user', 'project', 'local'] },
        background: { type: 'boolean' },
        omitClaudeMd: { type: 'boolean' },
        effort: { enum: ['low', 'medium', 'high', 'xhigh', 'max'] },
        isolation: { enum: ['worktree'] },
        color: { enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'] },
        initialPrompt: { type: 'string' },
        experimental: { type: 'object', properties: { cacheTtl: { enum: ['5m', '1h'] } } },
      },
    },
    {
      title: 'subagent 檔案 frontmatter 欄位',
      topics: ['frontmatter'],
      description:
        '`name` 與 `description` 必填。這是檔案形式的欄位，不含 Agent SDK 程式內定義才有的 `prompt`。內文是 subagent 的 system prompt。',
      verify: {
        probe: { kind: 'hash', anchor: 'Unique identifier of at most 256 characters', hash: 'sha256:d588d483a9bd81eb' },
        verifiedOn: '2.1.308',
      },
    },
  ),
]
