import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'github',
  topics: ['codeowners'],
  source: observedDoc({
    url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners',
    fetched: '2026-09-29',
  }),
})

export const codeownersFacts = [
  mf.statement(
    'codeowners-enforcement',
    '要在分支保護規則或 ruleset 啟用「Require review from Code Owners」才會強制審查。沒啟用時只自動指派審查者',
    {
      title: 'CODEOWNERS 的強制力',
      topics: ['branch-protection'],
      verify: {
        probe: { kind: 'hash', anchor: 'Require review from Code Owners', hash: 'sha256:6b49d146246f5f2f' },
        verifiedOn: '2026-09-29',
        screenedThrough: '2026-09-29',
      },
    },
  ),
]
