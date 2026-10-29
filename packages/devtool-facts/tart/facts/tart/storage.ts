import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'tart', topics: ['tart'], source: { kind: 'observed', basis: 'doc' } })

export const storageFacts = [
  mf.statement(
    'home-dir',
    'Tart 的家目錄預設是 `~/.tart`。環境變數 `TART_HOME` 有設時，改用它指的目錄，那個目錄不存在又建不起來時 Tart 報錯結束。Tart 每次啟動都會在家目錄下建立 `cache/` 與 `tmp/`',
    {
      title: 'Tart 的家目錄與 TART_HOME',
      topics: ['storage'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'environment["TART_HOME"]',
          hash: 'sha256:928ecff7270730dc',
          url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/Config.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/Config.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 Sources/tart/Config.swift',
      },
    },
  ),
  mf.statement(
    'home-layout',
    '預設家目錄 `~/.tart` 下，可以執行的本機映像（VM）放在 `vms/`，從遠端拉下來的映像放在 `cache/OCIs/`',
    {
      title: 'Tart 家目錄的內容',
      topics: ['storage'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Local images that you can run are stored in',
          hash: 'sha256:301c9d6f48c7d470',
          url: 'https://tart.run/faq/',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://tart.run/faq/',
        fetched: '2026-10-29',
        note: '讀 tart.run/faq，原文是 Local images that you can run are stored in ~/.tart/vms/，Remote images are pulled into ~/.tart/cache/OCIs/',
      },
    },
  ),
  mf.statement(
    'vm-directory',
    '一台本機 VM 是 `<家目錄>/vms/<名稱>/` 目錄，`config.json` 與 `nvram.bin` 必須都在，再依其他檔案分三種。有 `disk.img` 且沒有 `overlay.asif` 是獨立（standalone）VM。沒有 `disk.img`，有 `manifest.json` 與 `overlay.asif` 是疊層（stacked）VM，可以執行。沒有 `disk.img` 與 `overlay.asif`，只有 `manifest.json` 是疊層映像的快取紀錄，不可以執行。其他組合都不是可用的 VM',
    {
      title: '本機 VM 的目錄結構',
      topics: ['storage', 'vm'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'if !hasDisk && hasManifest && hasOverlay',
          hash: 'sha256:0741572d9beb608f',
          url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/VMDirectory.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/VMDirectory.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 Sources/tart/VMDirectory.swift。本機 Tart 2.40.1 的獨立 VM 目錄實際有 config.json、disk.img、nvram.bin（外加 control.sock）',
      },
    },
  ),
  mf.statement(
    'running-lock',
    '`tart run` 在 VM 活著的期間，持有 `<VM 目錄>/config.json` 的 fcntl 檔案鎖。Tart 用 `F_GETLK` 查詢，不必取鎖就能得到持有者的 PID，PID 非 0 就是執行中。開不了或查不了 `config.json` 時，視為沒在執行',
    {
      title: '執行中的 VM 持有 config.json 的鎖',
      topics: ['storage', 'vm'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'func pid() throws -> pid_t',
          hash: 'sha256:91ff6a0876bdee16',
          url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/PIDLock.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/PIDLock.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 PIDLock.swift（pid() 用 F_GETLK）、VMDirectory.swift（running()）與 Commands/Run.swift（trylock）',
      },
    },
  ),
  mf.statement(
    'gc-tmp',
    '除了 `pull` 與 `clone`，Tart 的每個指令執行前，都先刪除 `<家目錄>/tmp/` 裡沒被鎖住的項目，下載到一半的暫存也在內。所以 `pull` 或 `clone` 失敗後要接著重跑，中間插入的其他 tart 指令會刪掉暫存',
    {
      title: 'Tart 指令執行前清 tmp',
      topics: ['storage'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Run garbage-collection before each command',
          hash: 'sha256:ad6bd03c5e292cd6',
          url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/Root.swift',
        },
        verifiedOn: '2.40.1',
        screenedThrough: '2.40.1',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/cirruslabs/tart/blob/2.40.1/Sources/tart/Root.swift',
        fetched: '2026-10-29',
        note: '讀 cirruslabs/tart main 的 Sources/tart/Root.swift 與 Config.swift（gc）',
      },
    },
  ),
]
