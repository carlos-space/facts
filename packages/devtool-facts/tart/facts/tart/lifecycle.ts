import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'tart', topics: ['tart'], source: { kind: 'observed', basis: 'doc' } })

export const lifecycleFacts = [
  mf.statement(
    'stop-signal',
    '`tart stop <名稱>` 對執行中的 `tart run` 程序送 SIGINT，每 100 毫秒檢查它是否結束。`--timeout`（`-t`，單位秒，預設 30）內沒結束，就改送 SIGKILL。已暫停（suspended）的 VM 則刪除它儲存的狀態檔',
    {
      title: 'tart stop 的流程',
      topics: ['lifecycle'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'kill(pid, SIGINT)',
          hash: 'sha256:14392cc3e0a6848d',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Stop.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Stop.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 Sources/tart/Commands/Stop.swift；本機 tart 2.40.1 的 `tart stop --help` 相符',
      },
    },
  ),
  mf.statement(
    'stop-no-guest-shutdown',
    '`tart run` 收到 SIGINT 時取消執行，在 VM 還在跑的情況下呼叫 `VZVirtualMachine.stop()` 停止 VM，不通知客體作業系統關機，客體尚未寫入磁碟的資料不保證保留。要求客體關機的是 SIGUSR2（呼叫 `requestStop()`），`tart stop` 不用它',
    {
      title: 'tart stop 不經過客體關機',
      topics: ['lifecycle'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Triggered by "tart stop", Ctrl+C',
          hash: 'sha256:5776a84ecf62a045',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/VM.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/VM.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 Sources/tart/VM.swift（run()）與 Commands/Run.swift（SIGINT、SIGUSR2 處理）',
      },
    },
  ),
  mf.statement(
    'not-running-error',
    '對沒有在執行的 VM 跑 `tart stop` 或 `tart exec`，錯誤訊息是 `VM "<名稱>" is not running`，結束碼是 2',
    {
      title: '對沒在執行的 VM 下指令',
      topics: ['lifecycle'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Ensure that the VM is running',
          hash: 'sha256:685f2d1be41a119c',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Exec.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Exec.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1。對停止中的本機 VM linux-base 跑 `tart stop linux-base` 與 `tart exec linux-base true`，兩者都印這行並以 2 結束。原始碼在 Commands/Stop.swift 與 Commands/Exec.swift 丟出 VMNotRunning',
      },
    },
  ),
  mf.statement(
    'run-headless-flags',
    '`tart run --no-graphics` 不開 UI 視窗，`--no-audio` 關閉音訊轉送，`--no-clipboard` 關閉主機與客體之間的剪貼簿共享',
    {
      title: 'tart run 的無介面旗標',
      topics: ['lifecycle', 'run'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: "Don't open a UI window.",
          hash: 'sha256:7ce8f239cf4c32e8',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Run.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Run.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1 的 `tart run --help`；原始碼在 Commands/Run.swift',
      },
    },
  ),
  mf.statement(
    'run-dir-share',
    '`tart run --dir [name:]path[:options]` 把主機目錄共享給客體，旗標可重複。`options` 以逗號分隔，有 `ro`（唯讀）與 `tag=<TAG>`（掛載標籤）。預設標籤是 `com.apple.virtio-fs.automount`，macOS 客體自動掛在 `/Volumes/My Shared Files`。共用同一個標籤的多個目錄，每個都要加 `name:` 前綴，客體裡以 name 當子目錄名',
    {
      title: 'tart run --dir 共享目錄',
      topics: ['lifecycle', 'run'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Additional directory shares with an optional read-only and mount tag options',
          hash: 'sha256:53903af673061c5d',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Run.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Run.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1 的 `tart run --help`；原始碼在 Commands/Run.swift',
      },
    },
  ),
  mf.statement(
    'run-ends-with-guest',
    '客體停機後（自己關機，或被 `tart stop` 停止），`tart run` 程序跟著結束，結束碼 0。所以背景跑 `tart run` 的程式，可以靠這個程序結束得知客體已經停了',
    {
      title: 'tart run 隨客體停機結束',
      topics: ['lifecycle', 'run'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'func guestDidStop',
          hash: 'sha256:95b2a46a4508cd39',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/VM.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/VM.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 Sources/tart/VM.swift（guestDidStop）與 Commands/Run.swift（run() 之後 exit(0)）',
      },
    },
  ),
  mf.statement(
    'set-resources',
    '`tart set <名稱> --cpu <數量> --memory <MB>` 設定 VM 的 CPU 數與記憶體，`--memory` 的單位是 MB（megabytes）',
    {
      title: 'tart set 的 CPU 與記憶體',
      topics: ['lifecycle'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'VM memory size in megabytes',
          hash: 'sha256:753f46f58730cadc',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Set.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Set.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1 的 `tart set --help`；原始碼在 Commands/Set.swift',
      },
    },
  ),
  mf.statement(
    'ip-wait',
    '`tart ip <名稱> --wait <秒>` 最多等這麼多秒，讓 VM 開機取得 IP，預設 0 不等。預設的 dhcp 解析器從主機的 DHCP 租約檔，用 VM 的 MAC 位址找 IP，只適用沒有用橋接網路的 VM',
    {
      title: 'tart ip 的 --wait',
      topics: ['lifecycle', 'network'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Number of seconds to wait for a potential VM booting',
          hash: 'sha256:d377001f474c55be',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/IP.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/IP.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1 的 `tart ip --help`；原始碼在 Commands/IP.swift',
      },
    },
  ),
  mf.statement(
    'exec-guest-agent',
    '`tart exec [-i] [-t] <名稱> <指令>...` 在執行中的 VM 裡跑指令，需要客體裡有 Tart Guest Agent 在跑，Cirrus Labs 的非 vanilla 映像已內建。`-i` 把主機的標準輸入接給遠端指令，`-t` 配置偽終端（PTY）',
    {
      title: 'tart exec',
      topics: ['lifecycle', 'exec'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Requires Tart Guest Agent running in a guest VM',
          hash: 'sha256:dee50660cb206483',
          url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Exec.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'measured',
        url: 'https://github.com/cirruslabs/tart/blob/main/Sources/tart/Commands/Exec.swift',
        fetched: '2026-10-29',
        note: 'tart 2.40.1 的 `tart exec --help`；原始碼在 Commands/Exec.swift',
      },
    },
  ),
]
