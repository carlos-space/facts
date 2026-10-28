import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'apple-notarization',
  topics: ['gatekeeper'],
  source: { kind: 'observed', basis: 'measured', fetched: '2026-10-26' },
})

export const gatekeeperFacts = [
  mf.value(
    'spctl-assess-type',
    [
      { type: 'execute', meaning: '評估程式能不能執行，是預設值。檢查 app 用 `spctl -vvv --assess --type exec <app>`' },
      { type: 'install', meaning: '評估 installer package 能不能安裝' },
      { type: 'open', meaning: '評估文件能不能開啟' },
    ],
    {
      title: 'spctl 評估的類型',
      topics: ['cli'],
      verify: {
        probe: {
          kind: 'manual',
          reason: '在 Mac 讀 `man spctl` 的 `-t, --type`。成立的條件是列出 execute、install、open 三種，預設是 execute',
        },
        verifiedOn: '27.0.1',
        screenedThrough: '27.0.1',
      },
      note: '本機 `man spctl` 的 `-t, --type`，macOS 27.0.1。檢查 app 的指令取自 resolving-common-notarization-issues',
    },
  ),
]
