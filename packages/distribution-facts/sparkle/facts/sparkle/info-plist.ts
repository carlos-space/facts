import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'sparkle',
  topics: ['info-plist'],
  source: observedDoc({ url: 'https://sparkle-project.org/documentation/customization/', fetched: '2026-10-26' }),
})

export const infoPlistFacts = [
  mf.value(
    'info-plist-keys',
    [
      {
        key: 'SUFeedURL',
        type: 'String',
        default: null,
        meaning: 'appcast 的網址。建議寫在 Info.plist，之後在程式裡改也一樣',
      },
      { key: 'SUPublicEDKey', type: 'String', default: null, meaning: 'base64 的 EdDSA 公鑰，由 `generate_keys` 印出' },
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
    {
      title: 'Info.plist 的更新設定鍵',
      topics: ['update'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The number of seconds between automatic update checks',
          hash: 'sha256:552caaf4e6df3ab7',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
      note: '`default` 是 null 時文件沒寫預設值，行為照 `meaning`。只收一般與安全設定，沙盒用的四個鍵見 sparkle.non-sandboxed-xpc-keys',
    },
  ),
  mf.statement(
    'non-sandboxed-xpc-keys',
    '不開 App Sandbox 的 app 不設 `SUEnableInstallerLauncherService`、`SUEnableDownloaderService`、`SUEnableInstallerConnectionService`、`SUEnableInstallerStatusService`，四個都維持預設 NO。Installer Launcher 只有沙盒 app 才需要',
    {
      title: '不開沙盒時的 XPC 設定鍵',
      topics: ['sandbox', 'xpc'],
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
  ),
]
