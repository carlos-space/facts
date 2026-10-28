import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'crates-io',
  topics: ['authentication'],
  source: observedDoc({
    url: 'https://github.com/rust-lang/crates.io/blob/b5675037f2789e5d531adf5789d1cd115f612d1a/crates/crates_io_trustpub/src/github/workflows.rs',
    fetched: '2026-10-02',
  }),
})

export const authenticationFacts = [
  mf.statement(
    'cratesio-trusted-publishing-workflow-ref',
    'Trusted Publishing 從 OIDC token 的 `workflow_ref` 取出 workflow 檔名來比對',
    {
      title: 'Trusted Publishing 比對的檔名',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Extracts the workflow filename from a GitHub workflow reference',
          hash: 'sha256:614039e809f758bb',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
  mf.statement(
    'cratesio-trusted-publishing-first-publish',
    '設定 Trusted Publishing 前，crate 必須已經發布過。第一次發布要用 API token',
    {
      title: 'Trusted Publishing 的前提',
      topics: ['release'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Your crate must already be published to crates.io',
          hash: 'sha256:a2cd92fb80e0dbe3',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
      source: observedDoc({
        url: 'https://github.com/rust-lang/crates.io/blob/b5675037f2789e5d531adf5789d1cd115f612d1a/svelte/src/routes/docs/trusted-publishing/+page.svelte',
        fetched: '2026-10-02',
      }),
    },
  ),
]
