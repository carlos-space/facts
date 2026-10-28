import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'git',
  topics: ['commit'],
  source: observedDoc({ url: 'https://git-scm.com/docs/git-commit', fetched: '2026-10-01' }),
})

export const commitFacts = [
  mf.statement(
    'commit-cleanup-modes',
    '預設模式在開編輯器時等於 `strip`，會刪掉 `#` 開頭的行，`##` 標題跟著消失。`scissors` 保留 `#` 開頭的行，只刪掉剪刀線以下的內容。用 `-m` 或 `-F` 不開編輯器時，預設模式等於 `whitespace`，`##` 也保留',
    {
      title: '`commit.cleanup` 的模式',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Same as whitespace except that everything from (and including) the line found below is truncated',
          hash: 'sha256:fded9940f2fa7fa9',
        },
        verifiedOn: '2026-10-01',
        screenedThrough: '2026-10-01',
      },
    },
  ),
]
