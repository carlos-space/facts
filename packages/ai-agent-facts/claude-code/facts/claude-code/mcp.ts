import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['mcp'],
  source: { kind: 'observed', basis: 'doc', url: 'https://code.claude.com/docs/en/claude-directory.md' },
})

export const mcpFacts = [
  mf.value(
    'mcp-json-paths',
    { user: [], project: ['.mcp.json'] },
    {
      title: '.mcp.json 的位置',
      topics: ['paths'],
      description: '`.mcp.json` 只在專案根目錄，沒有 user 層與 managed 層。',
      verify: {
        probe: { kind: 'hash', anchor: 'Team-shared MCP servers', hash: 'sha256:a091739a17cecd01' },
        verifiedOn: '2.1.308',
      },
    },
  ),
]
