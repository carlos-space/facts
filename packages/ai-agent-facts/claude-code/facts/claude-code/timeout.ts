import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['timeout'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/tools-reference', fetched: '2026-10-03' }),
})

export const timeoutFacts = [
  mf.statement(
    'monitor-deadline',
    'Monitor 掛的每一次監看都有期限，預設 5 分鐘、最長 30 分鐘，用 `-p` 單次提示執行時最長 10 分鐘。期限到了監看結束，只通知一次，需要時再掛一次。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Every watch Claude starts has a deadline', hash: 'sha256:c36d8c5eddeb8135' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'background-command-time-limit',
    '背景指令的時限只在無人值守的會話（例如 `-p`、Agent SDK、CI）生效，預設 30 分鐘，`run_in_background` 帶 `timeout` 時最長 2 小時（7200000 毫秒）。從終端機、桌面版或 VS Code 擴充功能工作的本機會話沒有時限。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'A command that Claude starts in the background gets 30 minutes',
          hash: 'sha256:343668837e65ad8f',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
]
