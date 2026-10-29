import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'tart', topics: ['tart'], source: { kind: 'observed', basis: 'doc' } })

export const imagesFacts = [
  mf.statement(
    'clone-copy-on-write',
    '`tart clone <來源> <新名稱>` 的來源可以是本機或遠端 VM。因為 APFS 的 copy-on-write，複本不會馬上佔滿空間，只有複本改動的部分佔用新空間',
    {
      title: 'tart clone 的複本',
      topics: ['images'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: "a cloned VM won't actually claim all the space right away",
          hash: 'sha256:f9f9ff56934a0191',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Clone.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Clone.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1 的 `tart clone --help`；原始碼在 Commands/Clone.swift',
      },
    },
  ),
  mf.statement(
    'clone-auto-prune',
    '`tart clone` 與 `tart pull` 預設會檢查家目錄所在磁碟的可用空間，不夠放映像時自動清理快取。`tart clone --prune-limit <n>` 限制這次最多清 n GB，預設 100。設環境變數 `TART_NO_AUTO_PRUNE` 可關閉自動清理',
    {
      title: 'tart clone 的自動清理',
      topics: ['images'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'can be disabled by setting TART_NO_AUTO_PRUNE environment variable',
          hash: 'sha256:0b37712d3215d2c7',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Clone.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Clone.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1 的 `tart clone --help` 與 `tart pull --help`；原始碼在 Commands/Clone.swift',
      },
    },
  ),
  mf.statement(
    'rename',
    '`tart rename <名稱> <新名稱>` 改本機 VM 的名稱。新名稱不能含 `/`，新名稱已有 VM 時失敗，要先刪除那一台',
    {
      title: 'tart rename',
      topics: ['images'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'target VM \\(newName) already exists',
          hash: 'sha256:e0d8004412dbd8d3',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Rename.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Rename.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 Sources/tart/Commands/Rename.swift',
      },
    },
  ),
  mf.statement('delete', '`tart delete <名稱>...` 可以一次刪除多台 VM', {
    title: 'tart delete',
    topics: ['images'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'var name: [String]',
        hash: 'sha256:e66e8183d2345e1e',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Delete.swift',
      },
      verifiedOn: '2.40.1',
      screenedThrough: '2.40.1',
    },
    source: {
      kind: 'observed',
      basis: 'measured',
      url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Delete.swift',
      fetched: '2026-10-29',
      note: 'tart 2.40.1 的 `tart delete --help`；原始碼在 Commands/Delete.swift',
    },
  }),
]
