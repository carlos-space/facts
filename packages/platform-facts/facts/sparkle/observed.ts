import type { Fact } from '../../../fact-kit/src/index.ts'

export const observed: Fact[] = [
  {
    id: 'sparkle.info-plist-keys',
    tool: 'sparkle',
    topics: ['info-plist', 'update'],
    title: 'Info.plist 的更新設定鍵',
    content: {
      value: [
        {
          key: 'SUFeedURL',
          type: 'String',
          default: null,
          meaning: 'appcast 的網址。建議寫在 Info.plist，之後在程式裡改也一樣',
        },
        {
          key: 'SUPublicEDKey',
          type: 'String',
          default: null,
          meaning: 'base64 的 EdDSA 公鑰，由 `generate_keys` 印出',
        },
        {
          key: 'SUEnableAutomaticChecks',
          type: 'Boolean',
          default: null,
          meaning:
            '沒設時自動檢查先關閉，第二次啟動才問使用者要不要開。設 YES 直接開啟自動檢查（不含自動安裝），設 NO 直接關閉，兩者都不問使用者',
        },
        {
          key: 'SUScheduledCheckInterval',
          type: 'Number',
          default: 86400,
          meaning: '兩次自動檢查之間的秒數，最小 1 小時',
        },
        {
          key: 'SUAutomaticallyUpdate',
          type: 'Boolean',
          default: false,
          meaning: '設 YES 時在背景下載並安裝更新。需要授權時只下載不安裝',
        },
        {
          key: 'SUScheduledImpatientCheckInterval',
          type: 'Number',
          default: 604800,
          meaning:
            '更新已排在背景安裝後的檢查間隔秒數，超過仍沒結束 app 時提示使用者安裝。必須大於 SUScheduledCheckInterval，2.9 起可設',
        },
        {
          key: 'SUAllowsAutomaticUpdates',
          type: 'Boolean',
          default: null,
          meaning:
            '沒設時開了自動檢查就讓使用者選要不要自動更新。設 NO 一律手動安裝，設 YES 即使關了自動檢查也允許自動更新',
        },
        { key: 'SUEnableSystemProfiling', type: 'Boolean', default: false, meaning: '開啟匿名系統資訊回報' },
        { key: 'SUShowReleaseNotes', type: 'Boolean', default: true, meaning: '設 NO 時更新視窗不顯示版本說明' },
        { key: 'SUBundleName', type: 'String', default: null, meaning: '訊息裡用的替代顯示名稱' },
        { key: 'SUDefaultsDomain', type: 'String', default: null, meaning: '替代的 NSUserDefaults domain' },
        {
          key: 'SURelaunchHostBundle',
          type: 'Boolean',
          default: false,
          meaning: '外掛用，設 YES 時更新後重開宿主 bundle',
        },
        {
          key: 'SUVerifyUpdateBeforeExtraction',
          type: 'Boolean',
          default: false,
          meaning: '設 YES 時解開更新檔前先驗 EdDSA 簽章，2.7.3 起可設',
        },
        {
          key: 'SURequireSignedFeed',
          type: 'Boolean',
          default: false,
          meaning: '設 YES 時要求 appcast 與版本說明有簽章，要先開 SUVerifyUpdateBeforeExtraction，2.9 起可設',
        },
        {
          key: 'SUSignedFeedFailureExpirationInterval',
          type: 'Number',
          default: 1728000,
          meaning: 'feed 簽章驗證失敗多少秒後失效，0 表示不失效。要開 SURequireSignedFeed 才生效',
        },
        {
          key: 'SUAllowedURLSchemes',
          type: 'Array of Strings',
          default: null,
          meaning: '版本說明裡允許點的自訂 URL scheme，2.5 起可設',
        },
        { key: 'SUEnableJavaScript', type: 'Boolean', default: false, meaning: '設 YES 時版本說明可以執行 JavaScript' },
      ],
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://sparkle-project.org/documentation/customization/',
      fetched: '2026-10-26',
      note: '`default` 是 null 時文件沒寫預設值，行為照 `meaning`。只收一般與安全設定，沙盒用的四個鍵見 sparkle.non-sandboxed-xpc-keys',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'The number of seconds between automatic update checks',
        hash: 'sha256:552caaf4e6df3ab7',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'sparkle.non-sandboxed-xpc-keys',
    tool: 'sparkle',
    topics: ['info-plist', 'sandbox', 'xpc'],
    title: '不開沙盒時的 XPC 設定鍵',
    content: {
      statement:
        '不開 App Sandbox 的 app 不設 `SUEnableInstallerLauncherService`、`SUEnableDownloaderService`、`SUEnableInstallerConnectionService`、`SUEnableInstallerStatusService`，四個都維持預設 NO。Installer Launcher 只有沙盒 app 才需要',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://sparkle-project.org/documentation/customization/',
      fetched: '2026-10-26',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Applications that are not sandboxed should not customize any of these settings',
        hash: 'sha256:8d85faad44be6cbe',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'sparkle.remove-xpc-services',
    tool: 'sparkle',
    topics: ['sandbox', 'xpc', 'packaging'],
    title: '不開沙盒時可移除 XPC services',
    content: {
      statement:
        '不開沙盒、也沒啟用 XPC services 的 app，可以在把 `Sparkle.framework` 複製進 app 後刪掉 framework 裡的 XPC services，或從原始碼建置時不嵌入它們',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://sparkle-project.org/documentation/sandboxing/',
      fetched: '2026-10-26',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'you may choose to remove these services in a post install script',
        hash: 'sha256:42af7af5a1d89c82',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'sparkle.manual-signing-order',
    tool: 'sparkle',
    topics: ['codesign', 'packaging'],
    title: '手動重簽 Sparkle 的順序',
    content: {
      value: [
        {
          order: 1,
          path: 'Sparkle.framework/Versions/B/XPCServices/Installer.xpc',
          flags: '-f -s <identity> -o runtime',
        },
        {
          order: 2,
          path: 'Sparkle.framework/Versions/B/XPCServices/Downloader.xpc',
          flags: '-f -s <identity> -o runtime --preserve-metadata=entitlements',
        },
        { order: 3, path: 'Sparkle.framework/Versions/B/Autoupdate', flags: '-f -s <identity> -o runtime' },
        { order: 4, path: 'Sparkle.framework/Versions/B/Updater.app', flags: '-f -s <identity> -o runtime' },
        { order: 5, path: 'Sparkle.framework', flags: '-f -s <identity> -o runtime' },
      ],
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://sparkle-project.org/documentation/sandboxing/',
      fetched: '2026-10-26',
      note: '不走 Xcode archive 與 export 時，要照這個順序由內到外用自己的憑證重簽，`-o runtime` 是 hardened runtime。不加 `--deep`，因為 Downloader.xpc 可能帶自己的 entitlements。第 2 列是 2.6 以後的寫法。已移除 XPC services 時跳過第 1、2 列（sparkle.remove-xpc-services）',
    },
    verify: {
      probe: { kind: 'hash', anchor: 'The --deep option is not used here', hash: 'sha256:619cd0f36cc114f8' },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'sparkle.bundle-version-compare',
    tool: 'sparkle',
    topics: ['version', 'info-plist'],
    title: '用 CFBundleVersion 判斷新舊',
    content: {
      statement:
        'Sparkle 用 `CFBundleVersion` 判斷新舊，appcast 對應的是 `sparkle:version`。每一版的 `CFBundleVersion` 必須遞增且格式正確，`CFBundleShortVersionString` 與 `sparkle:shortVersionString` 只用來顯示',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://sparkle-project.org/documentation/',
      fetched: '2026-10-26',
      note: 'https://sparkle-project.org/documentation/、https://sparkle-project.org/documentation/publishing/',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Sparkle uses this to compare and determine the latest version of your bundle',
        hash: 'sha256:93a85945259ed969',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'sparkle.version-comparator',
    tool: 'sparkle',
    topics: ['version'],
    title: '版本字串的比較規則',
    content: {
      statement:
        '預設比較器把版本字串切成數字、字串與分隔符號三種段，逐段比較。數字段以整數比，所以 `0.3.302` 小於 `0.3.900`，`0.3.1301` 大於 `0.3.900`。同位置一邊是字串段時，不是字串的一邊較新。前段相同而段數不同時，多出的第一段是數字或句點的一邊較新，是字串的一邊較舊',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/Sparkle/SUStandardVersionComparator.m',
      fetched: '2026-10-26',
      note: '讀 2.10.0 的原始碼 `compareVersion:toVersion:`',
    },
    verify: {
      probe: { kind: 'hash', anchor: "It's a number/period. Larger version wins", hash: 'sha256:bef54ea3a796e63a' },
      verifiedOn: '2.10.0',
      screenedThrough: '2.10.0',
    },
  },
  {
    id: 'sparkle.generate-keys-options',
    tool: 'sparkle',
    topics: ['eddsa', 'cli'],
    title: 'generate_keys 的選項',
    content: {
      value: [
        {
          option: '（不帶選項）',
          value: null,
          meaning:
            '鑰匙圈沒有金鑰時產生一組 EdDSA 金鑰，私鑰存進登入鑰匙圈，印出公鑰與 Info.plist 的寫法。已有金鑰時沿用、不覆寫，只印出既有公鑰',
        },
        {
          option: '--account',
          value: 'ed25519',
          meaning: '鑰匙圈項目的帳號名稱，預設 `ed25519`。建議不同組織用不同帳號',
        },
        { option: '-p', value: null, meaning: '只查並印出鑰匙圈裡既有的公鑰，不能和 `-x`、`-f` 一起用' },
        {
          option: '-x',
          value: '<private-key-file>',
          meaning: '把鑰匙圈裡的私鑰匯出到檔案。新格式金鑰的匯出檔是私鑰 seed 的 base64',
        },
        {
          option: '-f',
          value: '<private-key-file>',
          meaning: '從檔案匯入私鑰到鑰匙圈，不產生新金鑰。鑰匙圈已有同名項目時可能要先手動刪除',
        },
      ],
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/generate_keys/main.swift',
      fetched: '2026-10-26',
      note: '讀 2.10.0 的原始碼。`value` 是預設值或參數名，null 表示不帶值。鑰匙圈項目的標籤是 `Private key for signing Sparkle updates`',
    },
    verify: {
      probe: { kind: 'hash', anchor: 'that key will be used and not overridden', hash: 'sha256:ae030f7a799a2e46' },
      verifiedOn: '2.10.0',
      screenedThrough: '2.10.0',
    },
  },
  {
    id: 'sparkle.generate-appcast-options',
    tool: 'sparkle',
    topics: ['appcast', 'cli'],
    title: 'generate_appcast 的常用選項',
    content: {
      value: [
        { option: '<archives-dir>', value: null, meaning: '必填的位置參數，放更新檔（dmg、zip）與 delta 的目錄' },
        {
          option: '--ed-key-file',
          value: '<private-EdDSA-key-file>',
          meaning:
            'EdDSA 私鑰檔路徑，沒給時從鑰匙圈讀。寫 `-` 時從標準輸入讀，例如 `echo "$KEY" | generate_appcast --ed-key-file - <dir>`',
        },
        { option: '--account', value: 'ed25519', meaning: '從鑰匙圈讀私鑰時用的帳號名稱' },
        { option: '--download-url-prefix', value: '<url>', meaning: '更新檔下載網址的前綴' },
        { option: '--release-notes-url-prefix', value: '<url>', meaning: '版本說明網址的前綴' },
        { option: '--link', value: '<link>', meaning: 'app 網站網址，無法在 app 內下載時導向這裡。預設不寫' },
        { option: '--channel', value: '<channel-name>', meaning: '新項目的 `sparkle:channel`，預設不分頻道' },
        { option: '--versions', value: '<versions>', meaning: '逗號分隔的 CFBundleVersion，只為這些版本產生新項目' },
        {
          option: '--maximum-versions',
          value: '3',
          meaning: '每個分支點保留的版本數，預設 3，0 表示全部保留',
        },
        { option: '--maximum-deltas', value: '5', meaning: '最新版每個分支點最多產生幾個 delta，預設 5' },
        { option: '-o', value: '<output-path>', meaning: '輸出的 appcast 檔路徑，只會產生一個 appcast 時才能用' },
        {
          option: '--auto-prune-update-files',
          value: null,
          meaning: '自動刪除 `old_updates` 裡超過 2 週沒動的舊更新檔',
        },
      ],
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/generate_appcast/main.swift',
      fetched: '2026-10-26',
      note: '讀 2.10.0 的原始碼，只收發布流程會用到的選項，DSA 與已棄用的 `-s` 不收。`value` 是預設值或參數名，null 表示不帶值',
    },
    verify: {
      probe: { kind: 'hash', anchor: 'can be used to echo the EdDSA key', hash: 'sha256:00894a73b3088c28' },
      verifiedOn: '2.10.0',
      screenedThrough: '2.10.0',
    },
  },
  {
    id: 'sparkle.appcast-merge-existing',
    tool: 'sparkle',
    topics: ['appcast'],
    title: 'generate_appcast 合併既有 appcast',
    content: {
      statement:
        '`generate_appcast` 依更新檔裡 `SUFeedURL` 的最後一段決定 appcast 檔名，沒有時用 `appcast.xml`。目錄（或 `-o`）已有同名 appcast 時讀進來合併。沒帶 `--versions` 時，比既有 feed 最新版還舊的新更新檔會被略過',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/generate_appcast/Appcast.swift',
      fetched: '2026-10-26',
      note: '讀 2.10.0 的原始碼。發布流程要先把已上線的 appcast 抓回目錄，舊項目才會保留',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'by default we ignore generating updates that are less than the latest update in the existing feed',
        hash: 'sha256:5a4d2036074e9546',
      },
      verifiedOn: '2.10.0',
      screenedThrough: '2.10.0',
    },
  },
  {
    id: 'sparkle.channels',
    tool: 'sparkle',
    topics: ['appcast', 'channel'],
    title: '同一個 feed 分頻道',
    content: {
      statement:
        'appcast 項目寫了 `<sparkle:channel>` 時，只有 `allowedChannels(for:)` 回傳的集合含這個頻道的 updater 看得到它。沒寫頻道的項目屬於預設頻道，所有 updater 都看得到。舊版 app 要用 Sparkle 2 才認得頻道',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://sparkle-project.org/documentation/publishing/',
      fetched: '2026-10-26',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Only updaters that are allowed to look in the beta channel can find this update',
        hash: 'sha256:62ebe13b553170dc',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
]
