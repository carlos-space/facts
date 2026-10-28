import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'github',
  topics: ['branch-protection'],
  source: observedDoc({
    url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches',
    fetched: '2026-10-02',
  }),
})

export const branchProtectionFacts = [
  mf.statement(
    'linear-history',
    '分支保護的 Require linear history 會擋下推進該分支的 merge commit，PR 只能用 squash 或 rebase 合併',
    {
      title: '線性歷史',
      topics: ['merge'],
      verify: {
        probe: { kind: 'hash', anchor: 'prevents collaborators from pushing merge', hash: 'sha256:0b1689adecdc2485' },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
  mf.statement(
    'protected-branch-plan-limit',
    'Free 方案的分支保護只能用在 public 倉庫。private 倉庫要 Pro、Team 或 Enterprise 方案，所以 Free 的私有倉庫擋不住 merge commit，只能在客戶端把關',
    {
      title: '分支保護的方案限制',
      topics: ['plan'],
      verify: {
        probe: { kind: 'hash', anchor: 'Protected branches are available in public', hash: 'sha256:51d50011b6c7b2c6' },
        verifiedOn: '2026-10-01',
        screenedThrough: '2026-10-01',
      },
      source: observedDoc({
        url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches',
        fetched: '2026-10-01',
      }),
    },
  ),
]
