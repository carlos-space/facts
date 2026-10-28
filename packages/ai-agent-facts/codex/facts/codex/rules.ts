import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'codex',
  topics: ['rules'],
  source: { kind: 'observed', basis: 'doc', url: 'https://learn.chatgpt.com/docs/agent-configuration/rules.md' },
})

export const rulesFacts = [
  mf.value(
    'rule-paths',
    {
      user: ['~/.codex/rules/default.rules', '~/.codex/rules/{name}.rules'],
      project: ['{repo}/.codex/rules/{name}.rules'],
    },
    {
      title: 'rules 檔案的位置',
      topics: ['paths'],
      description:
        '`.rules` 檔放在各啟用設定層旁邊的 `rules/` 資料夾。在 TUI 把指令加入允許清單時，Codex 寫入 `~/.codex/rules/default.rules`。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Codex scans `rules/` under every active config layer at startup',
          hash: 'sha256:9cc6b303a12c2f99',
        },
        verifiedOn: '2026-10-24',
      },
    },
  ),
]
