import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'codex',
  topics: ['agent'],
  source: { kind: 'observed', basis: 'doc', url: 'https://learn.chatgpt.com/docs/agent-configuration/subagents.md' },
})

export const agentFacts = [
  mf.value(
    'agent-paths',
    { user: ['~/.codex/agents/{name}.toml'], project: ['.codex/agents/{name}.toml'] },
    {
      title: '自訂 agent 檔案的位置',
      topics: ['paths'],
      description: '每個檔案是一個獨立的 TOML 檔，定義一個自訂 agent。檔案欄位見 `codex.agent-file`。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'To define your own custom agents, add standalone TOML files under',
          hash: 'sha256:e9cccefc62ec3438',
        },
        verifiedOn: '2026-10-24',
      },
    },
  ),
  mf.schema(
    'agent-file',
    {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'Codex agent file (agent-specific keys)',
      description: '其餘可用鍵同 `codex.config` 的頂層鍵（程式用 flatten 的 ConfigToml 讀入）。',
      type: 'object',
      required: ['name', 'description', 'developer_instructions'],
      properties: {
        name: { type: 'string', minLength: 1, description: 'Codex 啟動或指稱這個 agent 時用的名稱。' },
        description: { type: 'string', minLength: 1, description: '給人看的說明，何時該用這個 agent。' },
        nickname_candidates: { type: 'array', items: { type: 'string' } },
        developer_instructions: { type: 'string', minLength: 1, description: '定義 agent 行為的核心指示。' },
      },
    },
    {
      title: '自訂 agent TOML 檔的專屬鍵',
      topics: ['frontmatter'],
      description:
        '只列 agent 檔專屬的四個鍵。其餘可用的鍵與 `codex.config` 的頂層鍵相同，所以這個 schema 不設 `additionalProperties: false`。獨立的 agent 檔必須有 `name`、`description`、`developer_instructions`。',
      verify: {
        probe: { kind: 'hash', anchor: 'struct RawAgentRoleFileToml {', hash: 'sha256:43fedc749e5babd0' },
        verifiedOn: '2026-10-24',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/agent-roles/src/agent_role_config.rs#L22',
      },
    },
  ),
]
