import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'npm',
  topics: ['release'],
  source: observedDoc({
    url: 'https://github.com/npm/cli/blob/v11.19.0/lib/commands/publish.js',
    fetched: '2026-10-02',
  }),
})

export const releaseFacts = [
  mf.statement(
    'npm-prerelease-tag',
    'npm 11 發布預發布版時，沒指定 `--tag`，`publishConfig.tag` 也沒設，就拒絕發布。帶 `--force` 時略過這個檢查',
    {
      title: '預發布版的 dist-tag',
      topics: ['tag'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'You must specify a tag using --tag when publishing a prerelease version',
          hash: 'sha256:221edacd197423a9',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
]
