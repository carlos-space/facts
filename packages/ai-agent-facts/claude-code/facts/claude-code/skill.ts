import { factsOf, observedDoc, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['skill'],
  source: { kind: 'observed', basis: 'doc', url: 'https://code.claude.com/docs/en/skills.md' },
})

export const skillFacts = [
  mf.statement(
    'skill-tool-restriction',
    'skill 的 allowed-tools 只在觸發該 skill 的那個回合免詢問放行，不限縮可用工具：未列出的工具依然可以呼叫，只是仍受一般 permission 設定約束。授權在使用者送出下一則訊息時清除。user-invocable 設 false 時從選單隱藏，只由模型呼叫；disable-model-invocation 設 true 時只由使用者呼叫。',
    {
      topics: ['tool-restriction'],
      verify: {
        probe: { kind: 'hash', anchor: 'does not restrict which tools are available', hash: 'sha256:db5eb62374b88142' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/skills.md', fetched: '2026-10-02' }),
    },
  ),
  mf.statement('skill-content-injected', '用 Skill 工具載入時，SKILL.md 內文以一則訊息注入對話，不經過 Read 工具。', {
    verify: {
      probe: {
        kind: 'manual',
        reason:
          '在一個獨立的 git 倉庫放一個只要求回固定字的 skill，headless 跑 `claude -p "Use the probe-skill skill." --output-format stream-json --verbose --max-turns 6`，約 0.4 美元。成立的條件是只出現一個 Skill 的 tool_use、沒有 Read，SKILL.md 內文以一則 user 訊息出現',
      },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
    note: '本機 headless，Claude Code 2.1.285',
    source: observedSpike({ fetched: '2026-10-02' }),
  }),
  mf.value(
    'skill-paths',
    {
      managed: ['{managed-dir}/.claude/skills/{name}/SKILL.md'],
      user: ['~/.claude/skills/{name}/SKILL.md'],
      project: ['.claude/skills/{name}/SKILL.md', '{subdir}/.claude/skills/{name}/SKILL.md'],
      plugin: ['skills/{name}/SKILL.md'],
    },
    {
      title: 'skill 檔案的位置',
      topics: ['paths'],
      description:
        '每個 skill 是一個資料夾，裡面放 SKILL.md。managed 層放在 managed settings 目錄下，plugin 的路徑相對於 plugin 根目錄。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Where you save a skill decides which sessions load it',
          hash: 'sha256:2e04bf84e63c83b2',
        },
        verifiedOn: '2.1.308',
      },
    },
  ),
  mf.schema(
    'skill-frontmatter',
    {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'SKILL.md frontmatter',
      type: 'object',
      properties: {
        name: { type: 'string', description: '顯示在 `/` 選單的指令名稱，預設是資料夾名稱。' },
        description: { type: 'string', description: 'skill 做什麼、何時用。省略時取內文第一個非空行。' },
        when_to_use: { type: 'string', description: '補充何時該叫用，附加在 description 後面。' },
        'argument-hint': { type: 'string', description: '自動補全時顯示的參數提示。' },
        arguments: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: '具名位置參數，空白分隔的字串或 YAML 清單。',
        },
        'disable-model-invocation': { type: 'boolean', default: false },
        'user-invocable': { type: 'boolean', default: true },
        'allowed-tools': {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: 'skill 執行期間免詢問的工具。',
        },
        'disallowed-tools': {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: 'skill 執行期間從工具池移除的工具。',
        },
        model: { type: 'string', description: '使用的模型，與 `/model` 同值，或 `inherit`。' },
        effort: { enum: ['low', 'medium', 'high', 'xhigh', 'max'] },
        context: { enum: ['fork'], description: '設為 `fork` 時在分叉的 subagent 中執行。' },
        agent: { type: 'string', description: '`context: fork` 時使用的 subagent 類型。' },
        background: { type: 'boolean', default: true, description: '只在 `context: fork` 時有效。' },
        hooks: { type: 'object', description: 'skill 被叫用時註冊的 hooks。' },
        paths: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
          description: '限制 skill 啟用時機的 glob，逗號分隔字串或 YAML 清單。',
        },
        shell: { enum: ['bash', 'powershell'], default: 'bash' },
        metadata: { type: 'object', description: '自由格式的 map，Claude Code 不讀內容。' },
        license: { type: 'string' },
        compatibility: { type: 'string', maxLength: 500 },
      },
    },
    {
      title: 'SKILL.md frontmatter 欄位',
      topics: ['frontmatter'],
      description:
        '欄位全部選填，認不得的欄位會被忽略。boolean 欄位也接受 yes、no、on、off、1、0。frontmatter 只有在開頭的 `---` 是檔案第一行時才會被讀取。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Claude Code reads the frontmatter only when the opening',
          hash: 'sha256:fe9387835f3e43f8',
        },
        verifiedOn: '2.1.308',
      },
    },
  ),
]
