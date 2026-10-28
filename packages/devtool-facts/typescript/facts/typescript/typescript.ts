import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'typescript',
  topics: ['typescript'],
  source: observedDoc({
    url: 'https://www.typescriptlang.org/docs/handbook/project-references.html',
    fetched: '2026-09-29',
  }),
})

export const typescriptFacts = [
  mf.statement(
    'project-references',
    '`tsc --build` 依相依順序建置過期的專案。引用其他專案時讀的是上游產出的 `.d.ts`，上游建置前型別檢查會報錯',
    {
      title: '專案參照',
      topics: ['build'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'will instead load its output declaration file',
          hash: 'sha256:e9bd68962a663e50',
        },
        verifiedOn: '2026-09-29',
        screenedThrough: '2026-09-29',
      },
    },
  ),
]
