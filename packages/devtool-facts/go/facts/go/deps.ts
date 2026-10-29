import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'go', topics: ['go'], source: { kind: 'observed', basis: 'doc' } })

export const depsFacts = [
  mf.statement(
    'list-deps',
    '`go list -deps ./...` 除了命令列點名的套件，還列出它們所有遞移相依的套件，預設一行一個匯入路徑，相依排在使用它的套件前面（深度優先、後序）。命令列沒點名、只因相依而列出的套件，其 `DepOnly` 欄位為 true',
    {
      title: 'go list -deps',
      topics: ['list'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'It visits them in a depth-first post-order traversal',
          hash: 'sha256:d793657db3a7b02b',
          url: 'https://pkg.go.dev/cmd/go',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://pkg.go.dev/cmd/go',
        fetched: '2026-10-29',
        note: '讀 pkg.go.dev/cmd/go 的 go list 說明',
      },
    },
  ),
  mf.statement(
    'list-deps-excludes-tests',
    '`go list -deps` 只走套件非測試程式的相依，`_test.go` 才用到的 import 不在輸出裡。加 `-test` 才會另外報告測試執行檔（匯入路徑加 `.test` 後綴，例如 `example.com/m.test`），並把測試用的相依納入',
    {
      title: 'go list -deps 與測試相依',
      topics: ['list'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The -test flag causes list to report not only the named packages but also their test binaries',
          hash: 'sha256:6f6a76f5f868ba39',
          url: 'https://pkg.go.dev/cmd/go',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://pkg.go.dev/cmd/go',
        fetched: '2026-10-29',
        note: 'go1.26.6 darwin/arm64。模組 main.go 只 import fmt，main_test.go 另 import strings 與 testing。`GOWORK=off go list -deps ./...` 的輸出沒有 strings 與 testing；加 `-test` 後有 testing，並多一行 `example.com/m.test`。-test 的說明讀 pkg.go.dev/cmd/go',
      },
    },
  ),
  mf.statement(
    'list-format-fields',
    "`go list -f` 用 Go 的 text/template 語法格式化輸出，預設等於 `-f '{{.ImportPath}}'`。範本收到的 Package 結構裡，`ImportPath` 是套件的匯入路徑，`Imports` 是這個套件的非測試程式直接匯入的路徑，`TestImports` 是測試檔（TestGoFiles）匯入的路徑，`XTestImports` 是外部測試檔匯入的路徑",
    {
      title: 'go list -f 的 Package 欄位',
      topics: ['list'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The -f flag specifies an alternate format for the list',
          hash: 'sha256:41125a3f484e61e7',
          url: 'https://pkg.go.dev/cmd/go',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://pkg.go.dev/cmd/go',
        fetched: '2026-10-29',
        note: "go1.26.6 darwin/arm64。同一個模組跑 `GOWORK=off go list -f '{{.ImportPath}}: {{.Imports}} | {{.TestImports}}' ./...`，印出 `example.com/m: [fmt] | [strings testing]`。欄位說明讀 pkg.go.dev/cmd/go",
      },
    },
  ),
  mf.statement(
    'build-ignores-test-files',
    '`go build` 編譯套件時忽略檔名以 `_test.go` 結尾的檔案，這些檔案只在 `go test` 時編譯。所以只在 `_test.go` 裡的 import，不會進入 `go build` 產出的程式',
    {
      title: '建置忽略 _test.go',
      topics: ['build'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: "build ignores files that end in '_test.go'",
          hash: 'sha256:e14876f123e6815f',
          url: 'https://pkg.go.dev/cmd/go',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://pkg.go.dev/cmd/go',
        fetched: '2026-10-29',
        note: '讀 pkg.go.dev/cmd/go 的 go build 說明；`go list -deps` 的實測見 go.list-deps-excludes-tests',
      },
    },
  ),
]
