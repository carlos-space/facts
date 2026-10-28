import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'sparkle',
  topics: ['codesign'],
  source: observedDoc({ url: 'https://sparkle-project.org/documentation/sandboxing/', fetched: '2026-10-26' }),
})

export const codesignFacts = [
  mf.value(
    'manual-signing-order',
    [
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
    {
      title: '手動重簽 Sparkle 的順序',
      topics: ['packaging'],
      verify: {
        probe: { kind: 'hash', anchor: 'The --deep option is not used here', hash: 'sha256:619cd0f36cc114f8' },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
      note: '不走 Xcode archive 與 export 時，要照這個順序由內到外用自己的憑證重簽，`-o runtime` 是 hardened runtime。不加 `--deep`，因為 Downloader.xpc 可能帶自己的 entitlements。第 2 列是 2.6 以後的寫法。已移除 XPC services 時跳過第 1、2 列（sparkle.remove-xpc-services）',
    },
  ),
]
