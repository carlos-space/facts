import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'go', topics: ['go'], source: { kind: 'observed', basis: 'doc' } })

export const buildFacts = [
  mf.statement(
    'go-directive-minimum',
    'Go 1.21 起，`go.mod` 的 `go` 行宣告這個模組要求的最低 Go 版本，而且必須大於或等於所有相依模組的 `go` 行。一個 `go.mod` 最多一條 `go` 指令',
    {
      title: 'go.mod 的 go 行',
      topics: ['module'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The go line declares a required minimum version of Go',
          hash: 'sha256:db1e4fbae8290315',
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
        note: '讀 go.dev/ref/mod 的 go directive 一節，Go 1.21 以上的規則',
      },
    },
  ),
  mf.statement(
    'ldflags-x',
    '`go build -ldflags "-X main.version=1.2.3"` 把 `main` 套件裡名為 `version` 的字串變數設成 `1.2.3`。連結器的 `-X importpath.name=value` 只對字串變數有效，而且變數宣告時沒有初始值，或初始值是常數字串運算式。初始值呼叫函式或參照其他變數時不會生效',
    {
      title: 'ldflags 的 -X 設定字串變數',
      topics: ['ldflags'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Set the value of the string variable in importpath named name to value',
          hash: 'sha256:a04d34a035cdf85a',
          url: 'https://pkg.go.dev/cmd/link',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://pkg.go.dev/cmd/link',
        fetched: '2026-10-29',
        note: '讀 pkg.go.dev/cmd/link 的 -X 說明',
      },
    },
  ),
  mf.statement(
    'ldflags-arg-list',
    '`go build` 的 `-ldflags`、`-asmflags`、`-gcflags`、`-gccgoflags` 收到的是以空白分隔的引數清單，單一引數內要含空白時，用單引號或雙引號包起來。清單前可以加套件樣式與等號，限定只在建置符合的套件時使用',
    {
      title: 'ldflags 的引數清單',
      topics: ['ldflags'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'To embed spaces in an element in the list, surround it with either single or double quotes',
          hash: 'sha256:b0bb1ea334388c0e',
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
        note: '讀 pkg.go.dev/cmd/go 的 go build 說明',
      },
    },
  ),
  mf.statement(
    'embed-patterns',
    '`//go:embed` 的樣式相對於含該原始檔的套件目錄，路徑分隔用斜線。樣式不能含 `.`、`..` 或空的路徑元素，也不能以斜線開頭或結尾，所以不能嵌入套件目錄外的檔案。樣式不能比對到模組外的檔案、符號連結、`vendor/`，或含 `go.mod` 的目錄。每個樣式至少要比對到一個檔案或非空目錄，否則建置失敗',
    {
      title: '//go:embed 的樣式規則',
      topics: ['embed'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Patterns may not contain',
          hash: 'sha256:8450ddfbf260d229',
          url: 'https://pkg.go.dev/embed',
        },
        verifiedOn: '1.26.6',
        screenedThrough: '1.26.6',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://pkg.go.dev/embed',
        fetched: '2026-10-29',
        note: '讀 pkg.go.dev/embed',
      },
    },
  ),
  mf.statement(
    'build-constraint-filename',
    '檔名去掉副檔名與 `_test` 後綴後，以 `_GOOS`、`_GOARCH` 或 `_GOOS_GOARCH` 結尾，例如 `atime_darwin.go`，這個檔案就帶有隱含的建置限制，只在符合的作業系統與架構編譯',
    {
      title: '檔名後綴的建置限制',
      topics: ['build-constraint'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'is considered to have an implicit build constraint',
          hash: 'sha256:971198a9afa773b7',
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
        note: '讀 pkg.go.dev/cmd/go 的 go help buildconstraint',
      },
    },
  ),
  mf.statement(
    'build-constraint-line',
    '`//go:build` 建置限制是行註解，必須寫在檔案開頭，前面只能有空行與其他註解。在 Go 檔裡，它必須在 `package` 子句之前',
    {
      title: '//go:build 行的位置',
      topics: ['build-constraint'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'they must appear near the top of the file',
          hash: 'sha256:2afd2e15547db01f',
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
        note: '讀 pkg.go.dev/cmd/go 的 go help buildconstraint',
      },
    },
  ),
  mf.statement(
    'build-tags-flag',
    '`go build`、`go test` 等指令的 `-tags tag,list` 用逗號分隔，列出額外視為成立的建置標籤。檔案的限制是 `//go:build integration` 時，沒帶 `-tags integration` 就不編譯這個檔案',
    {
      title: '-tags 旗標',
      topics: ['build-constraint'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'a comma-separated list of additional build tags to consider satisfied',
          hash: 'sha256:4eb61e523ab9f328',
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
        note: '讀 pkg.go.dev/cmd/go 的 build flags',
      },
    },
  ),
]
