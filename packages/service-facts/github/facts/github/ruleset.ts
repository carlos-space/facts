import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'github',
  topics: ['ruleset'],
  source: observedDoc({
    url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets',
    fetched: '2026-09-29',
  }),
})

export const rulesetFacts = [
  mf.statement('ruleset-plan-limit', 'Free 方案的 ruleset 只能用在 public 倉庫。private 倉庫要付費方案才能用 ruleset', {
    title: 'ruleset 的方案限制',
    topics: ['plan'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Rulesets are available in public repositories with GitHub Free',
        hash: 'sha256:29074bb96ad254c9',
      },
      verifiedOn: '2026-09-29',
      screenedThrough: '2026-09-29',
    },
  }),
]
