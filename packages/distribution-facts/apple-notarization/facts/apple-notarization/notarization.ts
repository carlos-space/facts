import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'apple-notarization',
  topics: ['notarization'],
  source: observedDoc({
    url: 'https://developer.apple.com/tutorials/data/documentation/security/customizing-the-notarization-workflow.json',
    fetched: '2026-10-26',
  }),
})

export const notarizationFacts = [
  mf.value(
    'requirements',
    [
      '要散布的每個可執行檔都有有效的程式碼簽章',
      '簽章用 Developer ID 憑證（application、kernel extension、system extension 或 installer），不用 Mac Distribution、ad hoc、Apple Developer 或本機開發憑證',
      'app 與指令列 target 都開 hardened runtime',
      '簽章帶 secure timestamp',
      '不帶值為 true 的 `com.apple.security.get-task-allow` entitlement',
    ],
    {
      title: '公證對簽章的要求',
      topics: ['codesign'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'notary service requires you to adopt the following protections',
          hash: 'sha256:2af2f089429ce1f8',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
      note: '沒開 hardened runtime 時公證回 `The executable does not have the hardened runtime enabled.`（resolving-common-notarization-issues）',
      source: observedDoc({
        url: 'https://developer.apple.com/tutorials/data/documentation/security/notarizing-macos-software-before-distribution.json',
        fetched: '2026-10-26',
      }),
    },
  ),
  mf.statement(
    'secure-timestamp',
    'Xcode 一般建置不帶 secure timestamp，只有 archive 與 export 才加。自己簽章時給 `codesign` 加 `--timestamp`，否則公證回 `The signature does not include a secure timestamp.`。產生 timestamp 要連網',
    {
      title: 'secure timestamp',
      topics: ['codesign'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Generating a secure timestamp requires internet access',
          hash: 'sha256:3e3259c38c88dc24',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
      source: observedDoc({
        url: 'https://developer.apple.com/tutorials/data/documentation/security/resolving-common-notarization-issues.json',
        fetched: '2026-10-26',
      }),
    },
  ),
  mf.statement(
    'accepted-containers',
    '公證服務接受 UDIF 格式的 disk image、簽過章的 flat installer package 與 ZIP，也處理巢狀容器。它替送出的頂層檔與裡面每個巢狀項目各產生一張 ticket，例如送 dmg 時 dmg 與裡面的 app 都有',
    {
      title: '可以送公證的容器',
      topics: ['packaging'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The notary service accepts disk images (UDIF format)',
          hash: 'sha256:da41c649de7bdbd4',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
    },
  ),
  mf.statement(
    'staple-targets',
    '`xcrun stapler staple` 可以把 ticket 釘到 app、bundle、disk image 與 flat installer package，釘了之後 Gatekeeper 離線也找得到 ticket。ZIP 與單獨的二進位檔不能釘。送 ZIP 公證時，要對 ZIP 裡的每個項目各自 staple，再重新壓 ZIP',
    {
      title: 'stapler 能釘 ticket 的對象',
      topics: ['stapler'],
      verify: {
        probe: { kind: 'hash', anchor: 'you can notarize a ZIP archive', hash: 'sha256:bdc2fa5177ce5624' },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
    },
  ),
  mf.value(
    'notarytool-api-key',
    [
      { option: '-k, --key', value: '<key>', meaning: 'App Store Connect API key 私鑰（.p8）的檔案路徑' },
      { option: '-d, --key-id', value: '<key-id>', meaning: 'API key 的 ID，通常 10 個以上英數字元' },
      {
        option: '-i, --issuer',
        value: '<issuer>',
        meaning: 'Issuer ID，UUID 格式。Team API key 必填，Individual API key 不填',
      },
      { option: '--wait/--no-wait', value: 'false', meaning: '等公證處理完才結束，預設不等' },
      {
        option: '--timeout',
        value: '<duration>',
        meaning: '`--wait` 的等待上限。逾時 notarytool 結束，公證服務仍繼續處理',
      },
      {
        option: '-p, --keychain-profile',
        value: '<keychain-profile>',
        meaning: '改用 `store-credentials` 存進鑰匙圈的憑證，和上面三個 API key 選項擇一',
      },
    ],
    {
      title: 'notarytool submit 的 API key 選項',
      topics: ['cli', 'ci'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在裝了 Xcode 的 Mac 跑 `xcrun notarytool submit --help`。成立的條件是輸出有 `--key`、`--key-id`、`--issuer` 三個選項，`--issuer` 寫 Individual API key 不填，`--wait` 的預設是 false',
        },
        verifiedOn: '1.1.3',
        screenedThrough: '1.1.3',
      },
      note: '本機 `xcrun notarytool submit --help`，notarytool 1.1.3（42），Xcode 27.1。`value` 是預設值或參數名',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-26' },
    },
  ),
]
