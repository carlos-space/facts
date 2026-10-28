import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'codex',
  topics: ['config'],
  source: { kind: 'observed', basis: 'doc', url: 'https://learn.chatgpt.com/docs/config-file/config-basic.md' },
})

export const configFacts = [
  mf.value(
    'config-paths',
    { managed: ['/etc/codex/config.toml'], user: ['~/.codex/config.toml'], project: ['{dir}/.codex/config.toml'] },
    {
      title: 'config.toml 的位置',
      topics: ['paths'],
      description:
        '專案層的 `.codex/config.toml` 從專案根目錄到工作目錄逐層讀取，越近越優先，且只在受信任的專案生效。managed 層在 Unix 是 `/etc/codex/config.toml`。欄位見 `codex.config`。',
      verify: {
        probe: { kind: 'hash', anchor: 'Codex stores user-level configuration at', hash: 'sha256:80dea6257a63f59e' },
        verifiedOn: '2026-10-24',
      },
    },
  ),
]
