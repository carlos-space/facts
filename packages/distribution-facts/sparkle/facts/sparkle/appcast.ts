import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'sparkle',
  topics: ['appcast'],
  source: observedDoc({
    url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/generate_appcast/main.swift',
    fetched: '2026-10-26',
  }),
})

export const appcastFacts = [
  mf.value(
    'generate-appcast-options',
    [
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
      { option: '--maximum-versions', value: '3', meaning: '每個分支點保留的版本數，預設 3，0 表示全部保留' },
      { option: '--maximum-deltas', value: '5', meaning: '最新版每個分支點最多產生幾個 delta，預設 5' },
      { option: '-o', value: '<output-path>', meaning: '輸出的 appcast 檔路徑，只會產生一個 appcast 時才能用' },
      { option: '--auto-prune-update-files', value: null, meaning: '自動刪除 `old_updates` 裡超過 2 週沒動的舊更新檔' },
    ],
    {
      title: 'generate_appcast 的常用選項',
      topics: ['cli'],
      verify: {
        probe: { kind: 'hash', anchor: 'can be used to echo the EdDSA key', hash: 'sha256:00894a73b3088c28' },
        verifiedOn: '2.10.0',
        screenedThrough: '2.10.0',
      },
      note: '讀 2.10.0 的原始碼，只收發布流程會用到的選項，DSA 與已棄用的 `-s` 不收。`value` 是預設值或參數名，null 表示不帶值',
    },
  ),
  mf.statement(
    'appcast-merge-existing',
    '`generate_appcast` 依更新檔裡 `SUFeedURL` 的最後一段決定 appcast 檔名，沒有時用 `appcast.xml`。目錄（或 `-o`）已有同名 appcast 時讀進來合併。沒帶 `--versions` 時，比既有 feed 最新版還舊的新更新檔會被略過',
    {
      title: 'generate_appcast 合併既有 appcast',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'by default we ignore generating updates that are less than the latest update in the existing feed',
          hash: 'sha256:5a4d2036074e9546',
        },
        verifiedOn: '2.10.0',
        screenedThrough: '2.10.0',
      },
      note: '讀 2.10.0 的原始碼。發布流程要先把已上線的 appcast 抓回目錄，舊項目才會保留',
      source: observedDoc({
        url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/generate_appcast/Appcast.swift',
        fetched: '2026-10-26',
      }),
    },
  ),
  mf.statement(
    'channels',
    'appcast 項目寫了 `<sparkle:channel>` 時，只有 `allowedChannels(for:)` 回傳的集合含這個頻道的 updater 看得到它。沒寫頻道的項目屬於預設頻道，所有 updater 都看得到。舊版 app 要用 Sparkle 2 才認得頻道',
    {
      title: '同一個 feed 分頻道',
      topics: ['channel'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Only updaters that are allowed to look in the beta channel can find this update',
          hash: 'sha256:62ebe13b553170dc',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
      source: observedDoc({ url: 'https://sparkle-project.org/documentation/publishing/', fetched: '2026-10-26' }),
    },
  ),
]
