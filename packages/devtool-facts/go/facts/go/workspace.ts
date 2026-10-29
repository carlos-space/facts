import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'go', topics: ['go'], source: { kind: 'observed', basis: 'doc' } })

export const workspaceFacts = [
  mf.statement(
    'workspace-detection',
    '`go` 指令先看環境變數 `GOWORK`。`GOWORK=off` 時進單一模組模式，不讀 `go.work`。`GOWORK` 沒設或是空的，就從目前目錄往上層找 `go.work`，找到就進工作區模式，沒找到則只含目前目錄所在的模組。`GOWORK` 指到存在且副檔名是 `.work` 的檔案時啟用工作區模式，其他值是錯誤。`go env GOWORK` 印出實際使用的 `go.work`，不在工作區模式時是空字串',
    {
      title: 'go 指令如何決定要不要用 go.work',
      topics: ['workspace'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'the command will be in a single-module context',
          hash: 'sha256:355579ee40e92a2c',
          url: 'https://go.dev/ref/mod',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://go.dev/ref/mod',
        fetched: '2026-10-29',
        note: '讀 go.dev/ref/mod 的 Workspaces 與 Environment variables 兩節',
      },
    },
  ),
  mf.statement(
    'workspace-use',
    '`go.work` 的 `use` 指令引數是含 `go.mod` 的目錄的相對路徑，只加入那一個模組，不含它子目錄裡的其他模組。子目錄裡的模組要各寫一條 `use`',
    {
      title: 'go.work 的 use 指令',
      topics: ['workspace'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'A use directive does not add modules contained in subdirectories',
          hash: 'sha256:4845eb1cf1052f98',
          url: 'https://go.dev/ref/mod',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://go.dev/ref/mod',
        fetched: '2026-10-29',
        note: '讀 go.dev/ref/mod 的 use directive',
      },
    },
  ),
]
