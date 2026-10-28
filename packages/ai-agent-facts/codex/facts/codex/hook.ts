import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'codex',
  topics: ['hook'],
  source: { kind: 'observed', basis: 'doc', url: 'https://learn.chatgpt.com/docs/hooks.md' },
})

export const hookFacts = [
  mf.value(
    'hook-paths',
    {
      user: ['~/.codex/hooks.json', '~/.codex/config.toml'],
      project: ['{repo}/.codex/hooks.json', '{repo}/.codex/config.toml'],
      plugin: ['hooks/hooks.json'],
    },
    {
      title: 'hooks 設定的位置',
      topics: ['paths'],
      description:
        'hooks 放在各設定層旁邊的 `hooks.json`，或 `config.toml` 裡的 `[hooks]` 表。各來源的 hooks 全部載入，不互相取代。專案層只在該專案的 `.codex/` 受信任時載入。plugin 的路徑相對於 plugin 根目錄。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Codex discovers hooks next to active config layers',
          hash: 'sha256:4e90ceca39f7ea77',
        },
        verifiedOn: '2026-10-24',
      },
    },
  ),
]
