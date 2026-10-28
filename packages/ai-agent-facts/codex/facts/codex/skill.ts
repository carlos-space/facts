import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'codex',
  topics: ['skill'],
  source: { kind: 'observed', basis: 'doc', url: 'https://learn.chatgpt.com/docs/build-skills.md' },
})

export const skillFacts = [
  mf.value(
    'skill-paths',
    {
      managed: ['/etc/codex/skills/{name}/SKILL.md'],
      user: ['$HOME/.agents/skills/{name}/SKILL.md'],
      project: [
        '{cwd}/.agents/skills/{name}/SKILL.md',
        '{cwd}/../.agents/skills/{name}/SKILL.md',
        '{repo-root}/.agents/skills/{name}/SKILL.md',
      ],
    },
    {
      title: 'skill 檔案的位置',
      topics: ['paths'],
      description:
        '每個 skill 是一個資料夾，裡面放 SKILL.md。managed 層是機器或容器共用的系統位置。從工作目錄往上到 repo 根目錄的每一層 `.agents/skills` 都會掃描。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Codex reads skills from repository, user, admin, and system locations',
          hash: 'sha256:0d2aa8b95b0dbc41',
        },
        verifiedOn: '2026-10-24',
      },
    },
  ),
  mf.schema(
    'skill-frontmatter',
    {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'SKILL.md frontmatter',
      type: 'object',
      required: ['description'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 64, description: '缺漏時用資料夾名稱。' },
        description: { type: 'string', minLength: 1 },
        metadata: { type: 'object', properties: { 'short-description': { type: 'string' } } },
      },
    },
    {
      title: 'SKILL.md frontmatter 欄位',
      topics: ['frontmatter'],
      description:
        '依程式行為，只有 `description` 必填。文件說 `name` 也必填，但程式在 `name` 缺漏或為空時改用資料夾名稱。`agents/openai.yaml` 不是 frontmatter。',
      verify: {
        probe: { kind: 'hash', anchor: 'struct SkillFrontmatter {', hash: 'sha256:8dc0947398ae0cc0' },
        verifiedOn: '2026-10-24',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/skills/src/parser.rs#L7',
      },
    },
  ),
]
