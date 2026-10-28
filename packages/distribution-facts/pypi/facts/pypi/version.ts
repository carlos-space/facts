import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'pypi',
  topics: ['version'],
  source: observedDoc({
    url: 'https://packaging.python.org/en/latest/specifications/version-specifiers/',
    fetched: '2026-10-02',
  }),
})

export const versionFacts = [
  mf.statement(
    'pep440-prerelease',
    '版號照 PEP 440，預發布標記只有 `a`、`b`、`rc`。`alpha`、`beta` 視同 `a`、`b`，分隔符正規化成沒有分隔，所以 `2.0.0-alpha.1` 是 `2.0.0a1`。`2.0.0-staging.1` 不是合法版號',
    {
      title: '預發布版號的寫法',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Pre-releases allow the additional spellings of alpha',
          hash: 'sha256:e9498c7cb61f1dc8',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
]
