import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'github',
  topics: ['issue'],
  source: observedDoc({
    url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue',
    fetched: '2026-09-29',
  }),
})

export const issueFacts = [
  mf.statement(
    'issue-close-keywords',
    '`close`、`closes`、`closed`、`fix`、`fixes`、`fixed`、`resolve`、`resolves`、`resolved`',
    {
      title: 'Issue 關閉關鍵字',
      topics: ['issue-linking'],
      verify: {
        probe: { kind: 'hash', anchor: 'close closes closed fix fixes fixed resolve', hash: 'sha256:502da836bc0234d7' },
        verifiedOn: '2026-09-29',
        screenedThrough: '2026-09-29',
      },
    },
  ),
]
