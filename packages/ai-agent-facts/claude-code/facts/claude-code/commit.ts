import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['commit'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/settings-reference.md', fetched: '2026-10-01' }),
})

export const commitFacts = [
  mf.statement(
    'attribution-setting',
    '`attribution` 設成 `{"commit": "", "pr": "", "sessionUrl": false}` 時，commit 與 PR 都不加署名。設成 `false` 效果相同，但要 2.1.281 以上，較舊的版本會略過整份設定檔',
    {
      title: 'AI 署名設定',
      topics: ['pull-request'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'requires Claude Code v2.1.281 or later; earlier versions reject it and',
          hash: 'sha256:88472695da56e7fa',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'include-co-authored-by-deprecated',
    '`includeCoAuthoredBy` 從 2.0.62 起棄用，由 `attribution` 取代。Claude Code 仍會讀它，新設定改寫 `attribution`',
    {
      title: '`includeCoAuthoredBy` 已棄用',
      verify: {
        probe: { kind: 'hash', anchor: 'Deprecated since v2.0.62, when', hash: 'sha256:2ce9bac85a24e20d' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
]
