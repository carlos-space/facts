import type { Fact } from 'fact-kit'

// Where Codex reads each kind of resource from, and the frontmatter of skills and the keys of agent files.
// Paths come from the official documentation at learn.chatgpt.com. The skill and agent shapes come from the
// Rust source of openai/codex at rust-v0.164.0 (commit 6aaac694803004a63c6f393d153c96d22521a6b9), because the
// documentation and the code differ on what is required.
//
// Every path fact has the same `content.value` shape:
//   { project: string[], user: string[], managed?: string[], plugin?: string[] }
// `{name}` stands for the agent or skill name, `{dir}` for each directory from the project root down to the
// working directory, `{repo}` for the repository root, `{cwd}` for the working directory and `{repo-root}` for the topmost directory of the repository.
//
// Each hash comes from the workspace document probe (external-facts/probe.mjs): the page is normalized, the
// 300 characters on each side of the anchor are kept, and the first 16 hex digits of their sha256 are recorded.
// The probe strips anything between < and >, so an anchor never contains angle brackets.
const DOCS = 'https://learn.chatgpt.com/docs'
const COMMIT = '6aaac694803004a63c6f393d153c96d22521a6b9'
const BLOB = `https://github.com/openai/codex/blob/${COMMIT}/codex-rs`
const VERIFIED_ON = '2026-10-24'

const probe = (url: string, anchor: string, hash: string) => ({
  source: { kind: 'observed' as const, basis: 'doc' as const, url },
  verify: {
    probe: { kind: 'hash' as const, anchor, hash: `sha256:${hash}` },
    verifiedOn: VERIFIED_ON,
  },
})
const doc = (page: string, anchor: string, hash: string) => probe(`${DOCS}/${page}.md`, anchor, hash)
const code = (file: string, line: number, anchor: string, hash: string) =>
  probe(`${BLOB}/${file}#L${line}`, anchor, hash)

const SCHEMA = 'https://json-schema.org/draft/2020-12/schema'

export const paths: Fact[] = [
  {
    id: 'codex.agent-paths',
    tool: 'codex',
    topics: ['agent', 'paths'],
    title: '自訂 agent 檔案的位置',
    description: '每個檔案是一個獨立的 TOML 檔，定義一個自訂 agent。檔案欄位見 `codex.agent-file`。',
    content: {
      value: {
        user: ['~/.codex/agents/{name}.toml'],
        project: ['.codex/agents/{name}.toml'],
      },
    },
    ...doc(
      'agent-configuration/subagents',
      'To define your own custom agents, add standalone TOML files under',
      'e9cccefc62ec3438',
    ),
  },
  {
    id: 'codex.skill-paths',
    tool: 'codex',
    topics: ['skill', 'paths'],
    title: 'skill 檔案的位置',
    description:
      '每個 skill 是一個資料夾，裡面放 SKILL.md。managed 層是機器或容器共用的系統位置。從工作目錄往上到 repo 根目錄的每一層 `.agents/skills` 都會掃描。',
    content: {
      value: {
        managed: ['/etc/codex/skills/{name}/SKILL.md'],
        user: ['$HOME/.agents/skills/{name}/SKILL.md'],
        project: [
          '{cwd}/.agents/skills/{name}/SKILL.md',
          '{cwd}/../.agents/skills/{name}/SKILL.md',
          '{repo-root}/.agents/skills/{name}/SKILL.md',
        ],
      },
    },
    ...doc('build-skills', 'Codex reads skills from repository, user, admin, and system locations', '0d2aa8b95b0dbc41'),
  },
  {
    id: 'codex.hook-paths',
    tool: 'codex',
    topics: ['hook', 'paths'],
    title: 'hooks 設定的位置',
    description:
      'hooks 放在各設定層旁邊的 `hooks.json`，或 `config.toml` 裡的 `[hooks]` 表。各來源的 hooks 全部載入，不互相取代。專案層只在該專案的 `.codex/` 受信任時載入。plugin 的路徑相對於 plugin 根目錄。',
    content: {
      value: {
        user: ['~/.codex/hooks.json', '~/.codex/config.toml'],
        project: ['{repo}/.codex/hooks.json', '{repo}/.codex/config.toml'],
        plugin: ['hooks/hooks.json'],
      },
    },
    ...doc('hooks', 'Codex discovers hooks next to active config layers', '4e90ceca39f7ea77'),
  },
  {
    id: 'codex.rule-paths',
    tool: 'codex',
    topics: ['rules', 'paths'],
    title: 'rules 檔案的位置',
    description:
      '`.rules` 檔放在各啟用設定層旁邊的 `rules/` 資料夾。在 TUI 把指令加入允許清單時，Codex 寫入 `~/.codex/rules/default.rules`。',
    content: {
      value: {
        user: ['~/.codex/rules/default.rules', '~/.codex/rules/{name}.rules'],
        project: ['{repo}/.codex/rules/{name}.rules'],
      },
    },
    ...doc(
      'agent-configuration/rules',
      'Codex scans `rules/` under every active config layer at startup',
      '9cc6b303a12c2f99',
    ),
  },
  {
    id: 'codex.config-paths',
    tool: 'codex',
    topics: ['config', 'paths'],
    title: 'config.toml 的位置',
    description:
      '專案層的 `.codex/config.toml` 從專案根目錄到工作目錄逐層讀取，越近越優先，且只在受信任的專案生效。managed 層在 Unix 是 `/etc/codex/config.toml`。欄位見 `codex.config`。',
    content: {
      value: {
        managed: ['/etc/codex/config.toml'],
        user: ['~/.codex/config.toml'],
        project: ['{dir}/.codex/config.toml'],
      },
    },
    ...doc('config-file/config-basic', 'Codex stores user-level configuration at', '80dea6257a63f59e'),
  },
  {
    id: 'codex.agents-md-paths',
    tool: 'codex',
    topics: ['agents-md', 'paths'],
    title: 'AGENTS.md 指示檔的位置',
    description:
      '每一層只讀第一個存在的檔案，先 `AGENTS.override.md` 再 `AGENTS.md`。全域層只用第一個非空檔案。專案層從專案根目錄走到工作目錄，檔案由根往下串接，越近的越後面。`{dir}` 是路徑上的每個目錄。',
    content: {
      value: {
        user: ['~/.codex/AGENTS.override.md', '~/.codex/AGENTS.md'],
        project: ['{dir}/AGENTS.override.md', '{dir}/AGENTS.md'],
      },
    },
    ...doc('agent-configuration/agents-md', 'Codex builds an instruction chain when it starts', 'b7a6ea883c5ddf67'),
  },
  {
    id: 'codex.skill-frontmatter',
    tool: 'codex',
    topics: ['skill', 'frontmatter'],
    title: 'SKILL.md frontmatter 欄位',
    description:
      '依程式行為，只有 `description` 必填。文件說 `name` 也必填，但程式在 `name` 缺漏或為空時改用資料夾名稱。`agents/openai.yaml` 不是 frontmatter。',
    content: {
      schema: {
        $schema: SCHEMA,
        title: 'SKILL.md frontmatter',
        type: 'object',
        required: ['description'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 64, description: '缺漏時用資料夾名稱。' },
          description: { type: 'string', minLength: 1 },
          metadata: {
            type: 'object',
            properties: { 'short-description': { type: 'string' } },
          },
        },
      },
    },
    ...code('skills/src/parser.rs', 7, 'struct SkillFrontmatter {', '8dc0947398ae0cc0'),
  },
  {
    id: 'codex.agent-file',
    tool: 'codex',
    topics: ['agent', 'frontmatter'],
    title: '自訂 agent TOML 檔的專屬鍵',
    description:
      '只列 agent 檔專屬的四個鍵。其餘可用的鍵與 `codex.config` 的頂層鍵相同，所以這個 schema 不設 `additionalProperties: false`。獨立的 agent 檔必須有 `name`、`description`、`developer_instructions`。',
    content: {
      schema: {
        $schema: SCHEMA,
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
    },
    ...code('agent-roles/src/agent_role_config.rs', 22, 'struct RawAgentRoleFileToml {', '43fedc749e5babd0'),
  },
]
