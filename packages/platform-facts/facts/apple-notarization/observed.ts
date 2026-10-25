import type { Fact } from '../../../fact-kit/src/index.ts'

export const observed: Fact[] = [
  {
    id: 'apple-notarization.requirements',
    tool: 'apple-notarization',
    topics: ['notarization', 'codesign'],
    title: '公證對簽章的要求',
    content: {
      value: [
        '要散布的每個可執行檔都有有效的程式碼簽章',
        '簽章用 Developer ID 憑證（application、kernel extension、system extension 或 installer），不用 Mac Distribution、ad hoc、Apple Developer 或本機開發憑證',
        'app 與指令列 target 都開 hardened runtime',
        '簽章帶 secure timestamp',
        '不帶值為 true 的 `com.apple.security.get-task-allow` entitlement',
      ],
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://developer.apple.com/tutorials/data/documentation/security/notarizing-macos-software-before-distribution.json',
      fetched: '2026-10-26',
      note: '沒開 hardened runtime 時公證回 `The executable does not have the hardened runtime enabled.`（resolving-common-notarization-issues）',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'notary service requires you to adopt the following protections',
        hash: 'sha256:2af2f089429ce1f8',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'apple-notarization.secure-timestamp',
    tool: 'apple-notarization',
    topics: ['notarization', 'codesign'],
    title: 'secure timestamp',
    content: {
      statement:
        'Xcode 一般建置不帶 secure timestamp，只有 archive 與 export 才加。自己簽章時給 `codesign` 加 `--timestamp`，否則公證回 `The signature does not include a secure timestamp.`。產生 timestamp 要連網',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://developer.apple.com/tutorials/data/documentation/security/resolving-common-notarization-issues.json',
      fetched: '2026-10-26',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Generating a secure timestamp requires internet access',
        hash: 'sha256:3e3259c38c88dc24',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'apple-notarization.accepted-containers',
    tool: 'apple-notarization',
    topics: ['notarization', 'packaging'],
    title: '可以送公證的容器',
    content: {
      statement:
        '公證服務接受 UDIF 格式的 disk image、簽過章的 flat installer package 與 ZIP，也處理巢狀容器。它替送出的頂層檔與裡面每個巢狀項目各產生一張 ticket，例如送 dmg 時 dmg 與裡面的 app 都有',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://developer.apple.com/tutorials/data/documentation/security/customizing-the-notarization-workflow.json',
      fetched: '2026-10-26',
    },
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
  {
    id: 'apple-notarization.staple-targets',
    tool: 'apple-notarization',
    topics: ['notarization', 'stapler'],
    title: 'stapler 能釘 ticket 的對象',
    content: {
      statement:
        '`xcrun stapler staple` 可以把 ticket 釘到 app、bundle、disk image 與 flat installer package，釘了之後 Gatekeeper 離線也找得到 ticket。ZIP 與單獨的二進位檔不能釘。送 ZIP 公證時，要對 ZIP 裡的每個項目各自 staple，再重新壓 ZIP',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://developer.apple.com/tutorials/data/documentation/security/customizing-the-notarization-workflow.json',
      fetched: '2026-10-26',
    },
    verify: {
      probe: { kind: 'hash', anchor: 'you can notarize a ZIP archive', hash: 'sha256:bdc2fa5177ce5624' },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'apple-notarization.notarytool-api-key',
    tool: 'apple-notarization',
    topics: ['notarization', 'cli', 'ci'],
    title: 'notarytool submit 的 API key 選項',
    content: {
      value: [
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
    },
    source: {
      kind: 'observed',
      basis: 'measured',
      fetched: '2026-10-26',
      note: '本機 `xcrun notarytool submit --help`，notarytool 1.1.3（42），Xcode 27.1。`value` 是預設值或參數名',
    },
    verify: {
      probe: {
        kind: 'manual',
        reason:
          '在裝了 Xcode 的 Mac 跑 `xcrun notarytool submit --help`。成立的條件是輸出有 `--key`、`--key-id`、`--issuer` 三個選項，`--issuer` 寫 Individual API key 不填，`--wait` 的預設是 false',
      },
      verifiedOn: '1.1.3',
      screenedThrough: '1.1.3',
    },
  },
  {
    id: 'apple-notarization.spctl-assess-type',
    tool: 'apple-notarization',
    topics: ['gatekeeper', 'cli'],
    title: 'spctl 評估的類型',
    content: {
      value: [
        {
          type: 'execute',
          meaning: '評估程式能不能執行，是預設值。檢查 app 用 `spctl -vvv --assess --type exec <app>`',
        },
        { type: 'install', meaning: '評估 installer package 能不能安裝' },
        { type: 'open', meaning: '評估文件能不能開啟' },
      ],
    },
    source: {
      kind: 'observed',
      basis: 'measured',
      fetched: '2026-10-26',
      note: '本機 `man spctl` 的 `-t, --type`，macOS 27.0.1。檢查 app 的指令取自 resolving-common-notarization-issues',
    },
    verify: {
      probe: {
        kind: 'manual',
        reason: '在 Mac 讀 `man spctl` 的 `-t, --type`。成立的條件是列出 execute、install、open 三種，預設是 execute',
      },
      verifiedOn: '27.0.1',
      screenedThrough: '27.0.1',
    },
  },
]
