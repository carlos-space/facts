import { factsOf, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'git',
  topics: ['merge'],
  source: observedSpike({ fetched: '2026-10-01' }),
})

export const mergeFacts = [
  mf.statement(
    'squash-merge-detection',
    '`git rev-list --merges {遠端}/{預設分支}..HEAD` 在 `git merge --squash` 後沒有輸出，分支內合併過預設分支也一樣。一般合併後它列出 merge commit。`git diff --name-only` 的路徑依單元目錄分組，就算得出一個 commit 碰到幾個單元',
    {
      title: '查出 merge commit 與單元數',
      topics: ['monorepo'],
      verify: {
        probe: { kind: 'sample', path: 'prompts/_tools/version-control/main-history/merge-and-unit-detection.mjs' },
        verifiedOn: '2026-10-01',
        screenedThrough: '2026-10-01',
      },
      note: '本機 git 2.54.0，正反各一個樣本',
    },
  ),
]
