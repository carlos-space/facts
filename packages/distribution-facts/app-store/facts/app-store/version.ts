import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'app-store',
  topics: ['version'],
  source: observedDoc({
    url: 'https://developer.apple.com/tutorials/data/documentation/bundleresources/information-property-list/cfbundleshortversionstring.json',
    fetched: '2026-10-02',
  }),
})

export const versionFacts = [
  mf.statement(
    'app-store-short-version',
    '`CFBundleShortVersionString` 只能是三段以點分隔的整數，例如 `10.14.1`，只含數字與點',
    {
      title: '版號字串',
      verify: {
        probe: { kind: 'hash', anchor: 'three period-separated integers', hash: 'sha256:8ce3a4f424a75e47' },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
]
