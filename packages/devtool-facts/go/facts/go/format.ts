import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'go', topics: ['go'], source: { kind: 'observed', basis: 'doc' } })

export const formatFacts = [
  mf.statement(
    'gofmt-list',
    '`gofmt -l` 列出格式和 gofmt 不同的檔案名稱，不改檔。有檔案格式不同時結束碼仍是 0，所以腳本要判斷有沒有輸出，例如 `test -z "$(gofmt -l .)"`',
    {
      title: 'gofmt -l',
      topics: ['format'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'print its name to standard output',
          hash: 'sha256:11b5ca5e4aa6835e',
          url: 'https://pkg.go.dev/cmd/gofmt',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://pkg.go.dev/cmd/gofmt',
        fetched: '2026-10-29',
        note: 'go1.26.6 darwin/arm64。對含 `func  f( ){}` 的 a.go 跑 `gofmt -l .`，印出 `a.go`，結束碼 0。列出檔名的說明讀 pkg.go.dev/cmd/gofmt',
      },
    },
  ),
]
