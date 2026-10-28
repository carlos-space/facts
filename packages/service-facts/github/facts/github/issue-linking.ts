import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'github',
  topics: ['issue-linking'],
  source: observedDoc({
    url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue',
    fetched: '2026-09-29',
  }),
})

export const issueLinkingFacts = [
  mf.statement(
    'pr-keywords',
    'PR 的目標是預設分支時，關鍵字建立連結，合併後關閉 Issue。目標是其他分支時，關鍵字被忽略，不建立連結也不關閉',
    {
      title: 'PR 的關鍵字',
      topics: ['pull-request'],
      verify: {
        probe: { kind: 'hash', anchor: 'keywords are ignored, no links are created', hash: 'sha256:9f6f4ccd896d301b' },
        verifiedOn: '2026-09-29',
        screenedThrough: '2026-09-29',
      },
    },
  ),
  mf.statement('commit-keywords', 'commit 訊息裡的關鍵字，在該 commit 合進預設分支時關閉 Issue', {
    title: 'commit 訊息的關鍵字',
    topics: ['commit'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'issue will be closed when you merge the commit',
        hash: 'sha256:ffb14603c8d4b0a6',
      },
      verifiedOn: '2026-09-29',
      screenedThrough: '2026-09-29',
    },
  }),
]
