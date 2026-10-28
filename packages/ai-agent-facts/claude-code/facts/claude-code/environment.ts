import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['environment'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/settings-reference', fetched: '2026-10-06' }),
})

export const environmentFacts = [
  mf.statement(
    'settings-env-overrides-shell',
    '設定檔 `env` 裡的值會蓋掉 shell 匯出的同名變數。例外是由 Claude Desktop app 或自架環境的 runner 啟動的會話，這時啟動環境已設的變數優先，設定檔的值會被略過。',
    {
      topics: ['telemetry'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Variables Claude Code ignores in env lists the exceptions',
          hash: 'sha256:c50b787381311a64',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
]
