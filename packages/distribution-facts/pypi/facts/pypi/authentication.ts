import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'pypi',
  topics: ['authentication'],
  source: observedDoc({ url: 'https://docs.pypi.org/trusted-publishers/troubleshooting/', fetched: '2026-10-02' }),
})

export const authenticationFacts = [
  mf.statement('pypi-trusted-publishing-reusable', '可重用 workflow 目前不能當 Trusted Publisher 登記的 workflow', {
    title: 'Trusted Publishing 與可重用 workflow',
    topics: ['actions'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Reusable workflows cannot currently be used as the workflow in a Trusted Publisher',
        hash: 'sha256:f81d87657f023e13',
      },
      verifiedOn: '2026-10-02',
      screenedThrough: '2026-10-02',
    },
  }),
]
