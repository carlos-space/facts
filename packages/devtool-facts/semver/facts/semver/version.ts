import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'semver',
  topics: ['version'],
  source: observedDoc({ url: 'https://github.com/npm/node-semver/blob/v7.8.5/README.md', fetched: '2026-10-02' }),
})

export const versionFacts = [
  mf.statement(
    'identifier-base',
    'semver 的 `inc` 可以指定預發布序號從 0 或 1 起，命令列用 `-n` 指定。沒指定時從 0 起',
    {
      title: '預發布序號的起點',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'let you let your prerelease number as zero-based or one-based',
          hash: 'sha256:0f1f34380f078a1b',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
  mf.statement('caret-zero', '0.y.z（y 不為 0）的 caret 範圍只允許升修補號，例如 `^0.2.3` 等於 `>=0.2.3 <0.3.0-0`。', {
    title: 'semver-caret-zero',
    verify: {
      probe: { kind: 'hash', anchor: '^0.2.3 := >=0.2.3 <0.3.0-0', hash: 'sha256:e1bee7ceb5b944d5' },
      verifiedOn: '2026-09-30',
      screenedThrough: '2026-09-30',
    },
    source: observedDoc({ url: 'https://github.com/npm/node-semver', fetched: '2026-09-30' }),
  }),
]
