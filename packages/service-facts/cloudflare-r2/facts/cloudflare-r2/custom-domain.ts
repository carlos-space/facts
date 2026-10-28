import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'cloudflare-r2',
  topics: ['custom-domain'],
  source: observedDoc({ url: 'https://developers.cloudflare.com/r2/buckets/public-buckets/', fetched: '2026-10-26' }),
})

export const customDomainFacts = [
  mf.statement(
    'custom-domain-same-account',
    '綁到 R2 bucket 的自訂網域，必須是和 bucket 同一個 Cloudflare 帳號裡的 zone。網域的 DNS 不在 Cloudflare 時，要先用 partial（CNAME）設定加進帳號。一個 bucket 可以綁多個網域',
    {
      title: '自訂網域要在同一個帳號',
      topics: ['dns'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'must have been added as a zone in the same account as the R2 bucket',
          hash: 'sha256:f5bf0f0fd1979903',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
    },
  ),
  mf.statement(
    'custom-domain-cache',
    '經自訂網域存取 bucket 會走 Cloudflare Cache，預設只快取特定副檔名（cloudflare-r2.default-cached-extensions）。要快取所有檔案時設 Cache Everything 規則。要用快取、存取管理與 bot management，公開存取必須走自訂網域',
    {
      title: '自訂網域的快取',
      topics: ['cache'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'By default, only certain file types are cached',
          hash: 'sha256:2c53cf0c594a508f',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
    },
  ),
]
