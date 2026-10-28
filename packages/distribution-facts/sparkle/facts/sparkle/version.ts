import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'sparkle',
  topics: ['version'],
  source: observedDoc({ url: 'https://sparkle-project.org/documentation/', fetched: '2026-10-26' }),
})

export const versionFacts = [
  mf.statement(
    'bundle-version-compare',
    'Sparkle 用 `CFBundleVersion` 判斷新舊，appcast 對應的是 `sparkle:version`。每一版的 `CFBundleVersion` 必須遞增且格式正確，`CFBundleShortVersionString` 與 `sparkle:shortVersionString` 只用來顯示',
    {
      title: '用 CFBundleVersion 判斷新舊',
      topics: ['info-plist'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Sparkle uses this to compare and determine the latest version of your bundle',
          hash: 'sha256:93a85945259ed969',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
      note: 'https://sparkle-project.org/documentation/、https://sparkle-project.org/documentation/publishing/',
    },
  ),
  mf.statement(
    'version-comparator',
    '預設比較器把版本字串切成數字、字串與分隔符號三種段，逐段比較。數字段以整數比，所以 `0.3.302` 小於 `0.3.900`，`0.3.1301` 大於 `0.3.900`。同位置一邊是字串段時，不是字串的一邊較新。前段相同而段數不同時，多出的第一段是數字或句點的一邊較新，是字串的一邊較舊',
    {
      title: '版本字串的比較規則',
      verify: {
        probe: { kind: 'hash', anchor: "It's a number/period. Larger version wins", hash: 'sha256:bef54ea3a796e63a' },
        verifiedOn: '2.10.0',
        screenedThrough: '2.10.0',
      },
      note: '讀 2.10.0 的原始碼 `compareVersion:toVersion:`',
      source: observedDoc({
        url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/Sparkle/SUStandardVersionComparator.m',
        fetched: '2026-10-26',
      }),
    },
  ),
]
