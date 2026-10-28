import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'pnpm',
  topics: ['pnpm'],
  source: observedDoc({ url: 'https://pnpm.io/filtering', fetched: '2026-09-29' }),
})

export const pnpmFacts = [
  mf.statement('filter-by-change', '`--filter "...[origin/main]"` 選出該 commit 之後有變更的套件，以及相依它們的套件', {
    title: '依變更選套件',
    topics: ['filter'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Selects all the packages changed since the specified commit',
        hash: 'sha256:7d569c3aa7582459',
      },
      verifiedOn: '2026-09-29',
      screenedThrough: '2026-09-29',
    },
  }),
  mf.statement('include-workspace-root', '遞迴執行的指令預設不含根專案，設 `include-workspace-root` 才納入', {
    title: '根專案',
    topics: ['recursive'],
    verify: {
      probe: { kind: 'hash', anchor: 'set the includeWorkspaceRoot setting to true', hash: 'sha256:48c6e0c0b176f803' },
      verifiedOn: '2026-10-02',
      screenedThrough: '2026-10-02',
    },
    source: observedDoc({ url: 'https://pnpm.io/cli/recursive', fetched: '2026-10-02' }),
  }),
  mf.statement(
    'pnpm-minimum-release-age',
    'pnpm 從 v11 起 `minimumReleaseAge` 預設 1440 分鐘，發布未滿這段時間的版本裝不到。',
    {
      topics: ['version'],
      verify: {
        probe: { kind: 'hash', anchor: 'Default: 1440 (since v11), 0 (before v11)', hash: 'sha256:d4700bb4b5e48e96' },
        verifiedOn: '2026-09-30',
        screenedThrough: '2026-09-30',
      },
      source: observedDoc({ url: 'https://pnpm.io/settings/dependency-resolution', fetched: '2026-09-30' }),
    },
  ),
  mf.statement(
    'pnpm-global-add-fresh-release',
    '`pnpm add -g` 裝剛發布數分鐘的 mainflow 版本時，不被 `minimumReleaseAge` 擋下',
    {
      topics: ['version'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在 mainflow 發布後數分鐘內執行 `pnpm add -g mainflow@<新版>`。成立的條件是安裝成功，沒有報最短發布時間的錯',
        },
        verifiedOn: '2026-10-20',
        screenedThrough: '2026-10-20',
      },
      note: '本機 pnpm 12.3.4，2026-10-20，n=1',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-20' },
    },
  ),
]
