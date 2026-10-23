import type { Fact } from '../../../fact-kit/src/index.ts'

// Where Claude Code reads each kind of resource from, and the frontmatter fields of skills, agents and rules.
// All of it is read from the official documentation at code.claude.com. The Agent SDK has neither the paths
// nor a frontmatter type for these files, and its `AgentDefinition` is the in-process shape, so it is not used.
//
// Every path fact has the same `content.value` shape:
//   { project: string[], user: string[], managed?: string[], plugin?: string[] }
// `{name}` stands for the skill, agent or file name, `{subdir}` for any directory below the project root and
// `{managed-dir}` for the managed settings directory of the operating system. The Windows managed directory
// is written with `%ProgramFiles%` because the documentation says `C:\Program Files` and `check` rejects drive paths. A `plugin` path is relative to
// the plugin root.
//
// Each hash comes from the workspace document probe (external-facts/probe.mjs): the page is normalized, the
// 300 characters on each side of the anchor are kept, and the first 16 hex digits of their sha256 are recorded.
const DOCS = 'https://code.claude.com/docs/en'
const VERIFIED_ON = '2.1.308'

const doc = (page: string, anchor: string, hash: string) => ({
  source: { kind: 'observed' as const, basis: 'doc' as const, url: `${DOCS}/${page}.md` },
  verify: {
    probe: { kind: 'hash' as const, anchor, hash: `sha256:${hash}` },
    verifiedOn: VERIFIED_ON,
  },
})

const SCHEMA = 'https://json-schema.org/draft/2020-12/schema'
const effort = ['low', 'medium', 'high', 'xhigh', 'max']
const stringOrList = { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] }

export const paths: Fact[] = [
  {
    id: 'claude-code.skill-paths',
    tool: 'claude-code',
    topics: ['skill', 'paths'],
    title: 'skill 檔案的位置',
    description:
      '每個 skill 是一個資料夾，裡面放 SKILL.md。managed 層放在 managed settings 目錄下，plugin 的路徑相對於 plugin 根目錄。',
    content: {
      value: {
        managed: ['{managed-dir}/.claude/skills/{name}/SKILL.md'],
        user: ['~/.claude/skills/{name}/SKILL.md'],
        project: ['.claude/skills/{name}/SKILL.md', '{subdir}/.claude/skills/{name}/SKILL.md'],
        plugin: ['skills/{name}/SKILL.md'],
      },
    },
    ...doc('skills', 'Where you save a skill decides which sessions load it', '2e04bf84e63c83b2'),
  },
  {
    id: 'claude-code.agent-paths',
    tool: 'claude-code',
    topics: ['agent', 'paths'],
    title: 'subagent 檔案的位置',
    description:
      '每個 subagent 是一個 Markdown 檔，會遞迴掃描子資料夾，檔名不必等於 `name`。managed 層由 managed settings 部署，文件沒寫檔案路徑，所以不列。plugin 的路徑相對於 plugin 根目錄。',
    content: {
      value: {
        user: ['~/.claude/agents/{name}.md'],
        project: ['.claude/agents/{name}.md'],
        plugin: ['agents/{name}.md'],
      },
    },
    ...doc('sub-agents', 'Store subagent files in different locations depending on scope', '51d739458a9feaa4'),
  },
  {
    id: 'claude-code.rule-paths',
    tool: 'claude-code',
    topics: ['rule', 'paths'],
    title: 'rule 檔案的位置',
    description: '`.md` 檔會遞迴掃描子資料夾。rule 沒有 managed 層與 plugin 層。',
    content: {
      value: {
        user: ['~/.claude/rules/**/*.md'],
        project: ['.claude/rules/**/*.md'],
      },
    },
    ...doc('memory', 'you can organize instructions into multiple files using the', 'ac676b1a3f695f85'),
  },
  {
    id: 'claude-code.settings-paths',
    tool: 'claude-code',
    topics: ['settings', 'paths'],
    title: 'settings 檔案的位置',
    description:
      'managed 層的檔名是 `managed-settings.json`，放在各作業系統的系統目錄，也可以由 claude.ai console 等其他來源送達。',
    content: {
      value: {
        managed: [
          '/Library/Application Support/ClaudeCode/managed-settings.json',
          '/etc/claude-code/managed-settings.json',
          '%ProgramFiles%\\ClaudeCode\\managed-settings.json',
        ],
        user: ['~/.claude/settings.json'],
        project: ['.claude/settings.json', '.claude/settings.local.json'],
      },
    },
    ...doc('settings', 'Claude Code reads settings from four files', '768727599180e074'),
  },
  {
    id: 'claude-code.memory-paths',
    tool: 'claude-code',
    topics: ['memory', 'paths'],
    title: 'CLAUDE.md 記憶檔的位置',
    description:
      '依載入順序由廣到窄。工作目錄以上各層的 CLAUDE.md 與 CLAUDE.local.md 啟動時載入，子資料夾裡的在 Claude 讀寫該資料夾的檔案時才載入。',
    content: {
      value: {
        managed: [
          '/Library/Application Support/ClaudeCode/CLAUDE.md',
          '/etc/claude-code/CLAUDE.md',
          '%ProgramFiles%\\ClaudeCode\\CLAUDE.md',
        ],
        user: ['~/.claude/CLAUDE.md'],
        project: ['./CLAUDE.md', './.claude/CLAUDE.md', './CLAUDE.local.md'],
      },
    },
    ...doc('memory', 'CLAUDE.md files can live in several locations, each with a different scope', 'df9c39c738c42097'),
  },
  {
    id: 'claude-code.mcp-json-paths',
    tool: 'claude-code',
    topics: ['mcp', 'paths'],
    title: '.mcp.json 的位置',
    description: '`.mcp.json` 只在專案根目錄，沒有 user 層與 managed 層。',
    content: {
      value: {
        user: [],
        project: ['.mcp.json'],
      },
    },
    ...doc('claude-directory', 'Team-shared MCP servers', 'a091739a17cecd01'),
  },
  {
    id: 'claude-code.plugin-layout',
    tool: 'claude-code',
    topics: ['plugin', 'paths'],
    title: 'plugin 的標準目錄佈局',
    description:
      '`plugin` 裡的路徑都相對於 plugin 根目錄。`.claude-plugin/plugin.json` 選填，只有 `name` 必填。其他檔案放在 plugin 根目錄，不放進 `.claude-plugin/`。plugin 沒有 project 層與 user 層。',
    content: {
      value: {
        user: [],
        project: [],
        plugin: [
          '.claude-plugin/plugin.json',
          'skills/{name}/SKILL.md',
          'commands/{name}.md',
          'agents/{name}.md',
          'hooks/hooks.json',
          '.mcp.json',
          '.lsp.json',
          'output-styles/{name}.md',
          'workflows/{name}.js',
          'themes/{name}.json',
          'monitors/monitors.json',
          'bin/{name}',
          'settings.json',
        ],
      },
    },
    ...doc('plugins-reference', 'Each component type has a default location under the plugin root', '1e753a0ad0f7d783'),
  },
  {
    id: 'claude-code.skill-frontmatter',
    tool: 'claude-code',
    topics: ['skill', 'frontmatter'],
    title: 'SKILL.md frontmatter 欄位',
    description:
      '欄位全部選填，認不得的欄位會被忽略。boolean 欄位也接受 yes、no、on、off、1、0。frontmatter 只有在開頭的 `---` 是檔案第一行時才會被讀取。',
    content: {
      schema: {
        $schema: SCHEMA,
        title: 'SKILL.md frontmatter',
        type: 'object',
        properties: {
          name: { type: 'string', description: '顯示在 `/` 選單的指令名稱，預設是資料夾名稱。' },
          description: { type: 'string', description: 'skill 做什麼、何時用。省略時取內文第一個非空行。' },
          when_to_use: { type: 'string', description: '補充何時該叫用，附加在 description 後面。' },
          'argument-hint': { type: 'string', description: '自動補全時顯示的參數提示。' },
          arguments: { ...stringOrList, description: '具名位置參數，空白分隔的字串或 YAML 清單。' },
          'disable-model-invocation': { type: 'boolean', default: false },
          'user-invocable': { type: 'boolean', default: true },
          'allowed-tools': { ...stringOrList, description: 'skill 執行期間免詢問的工具。' },
          'disallowed-tools': { ...stringOrList, description: 'skill 執行期間從工具池移除的工具。' },
          model: { type: 'string', description: '使用的模型，與 `/model` 同值，或 `inherit`。' },
          effort: { enum: effort },
          context: { enum: ['fork'], description: '設為 `fork` 時在分叉的 subagent 中執行。' },
          agent: { type: 'string', description: '`context: fork` 時使用的 subagent 類型。' },
          background: { type: 'boolean', default: true, description: '只在 `context: fork` 時有效。' },
          hooks: { type: 'object', description: 'skill 被叫用時註冊的 hooks。' },
          paths: { ...stringOrList, description: '限制 skill 啟用時機的 glob，逗號分隔字串或 YAML 清單。' },
          shell: { enum: ['bash', 'powershell'], default: 'bash' },
          metadata: { type: 'object', description: '自由格式的 map，Claude Code 不讀內容。' },
          license: { type: 'string' },
          compatibility: { type: 'string', maxLength: 500 },
        },
      },
    },
    ...doc('skills', 'Claude Code reads the frontmatter only when the opening', 'fe9387835f3e43f8'),
  },
  {
    id: 'claude-code.agent-frontmatter',
    tool: 'claude-code',
    topics: ['agent', 'frontmatter'],
    title: 'subagent 檔案 frontmatter 欄位',
    description:
      '`name` 與 `description` 必填。這是檔案形式的欄位，不含 Agent SDK 程式內定義才有的 `prompt`。內文是 subagent 的 system prompt。',
    content: {
      schema: {
        $schema: SCHEMA,
        title: 'subagent frontmatter',
        type: 'object',
        required: ['name', 'description'],
        properties: {
          name: { type: 'string', maxLength: 256, pattern: '^[^:]+$', description: '唯一識別名稱，不可含 `:`。' },
          description: { type: 'string', description: 'Claude 何時該委派給這個 subagent。' },
          tools: { ...stringOrList, description: 'subagent 可用的工具，省略時繼承全部。' },
          disallowedTools: { ...stringOrList, description: '要拒絕的工具。' },
          model: { type: 'string', description: '`sonnet`、`opus`、`haiku`、`fable`、完整模型 ID 或 `inherit`。' },
          permissionMode: {
            enum: ['default', 'acceptEdits', 'auto', 'dontAsk', 'bypassPermissions', 'plan', 'manual'],
          },
          maxTurns: { type: 'integer', minimum: 1 },
          autoCompactWindow: { type: 'integer', minimum: 100000, maximum: 1000000 },
          skills: { type: 'array', items: { type: 'string' }, description: '啟動時預載的 skills。' },
          mcpServers: {
            type: 'array',
            description: '已設定的 server 名稱，或以 server 名稱為鍵的內嵌定義。',
          },
          hooks: { type: 'object' },
          memory: { enum: ['user', 'project', 'local'] },
          background: { type: 'boolean' },
          omitClaudeMd: { type: 'boolean' },
          effort: { enum: effort },
          isolation: { enum: ['worktree'] },
          color: { enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'] },
          initialPrompt: { type: 'string' },
          experimental: {
            type: 'object',
            properties: { cacheTtl: { enum: ['5m', '1h'] } },
          },
        },
      },
    },
    ...doc('sub-agents', 'Unique identifier of at most 256 characters', 'd588d483a9bd81eb'),
  },
  {
    id: 'claude-code.rule-frontmatter',
    tool: 'claude-code',
    topics: ['rule', 'frontmatter'],
    title: 'rule 檔案 frontmatter 欄位',
    description: 'rule 只讀 `paths`，其他欄位不報錯地忽略。frontmatter 在載入進上下文前會被移除。',
    content: {
      schema: {
        $schema: SCHEMA,
        title: 'rule frontmatter',
        type: 'object',
        properties: {
          paths: { ...stringOrList, description: '限定 rule 生效檔案的 glob，YAML 清單或逗號分隔字串。' },
        },
      },
    },
    ...doc('memory', 'is the only field Claude Code reads from a rule', 'd74824d268a62bdc'),
  },
]
