import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'google-play',
  topics: ['version'],
  source: observedDoc({ url: 'https://developer.android.com/studio/publish/versioning?hl=en', fetched: '2026-10-02' }),
})

export const versionFacts = [
  mf.statement(
    'play-version-code-limit',
    '`versionCode` 的上限是 2100000000。每次發布的值要比前一版大，用過的值不能再上傳',
    {
      title: 'versionCode 的上限',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The greatest value Google Play allows for versionCode is 2100000000',
          hash: 'sha256:af6a82873350205b',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
]
