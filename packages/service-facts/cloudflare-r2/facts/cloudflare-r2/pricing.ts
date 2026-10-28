import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'cloudflare-r2',
  topics: ['pricing'],
  source: observedDoc({ url: 'https://developers.cloudflare.com/r2/pricing/', fetched: '2026-10-26' }),
})

export const pricingFacts = [
  mf.value(
    'free-tier',
    [
      { item: 'Storage', free: '10 GB-month' },
      { item: 'Class A Operations', free: '1 million requests' },
      { item: 'Class B Operations', free: '10 million requests' },
      { item: 'Egress', free: 'free' },
    ],
    {
      title: '每月免費額度',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The free tier only applies to Standard storage',
          hash: 'sha256:45972fa2b2009bed',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
      note: '每月額度，只適用 Standard storage，不適用 Infrequent Access。所有儲存類別的 egress 都不收費',
    },
  ),
]
