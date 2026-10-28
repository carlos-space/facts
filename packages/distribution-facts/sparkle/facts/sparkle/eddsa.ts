import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'sparkle',
  topics: ['eddsa'],
  source: observedDoc({
    url: 'https://github.com/sparkle-project/Sparkle/blob/2.10.0/generate_keys/main.swift',
    fetched: '2026-10-26',
  }),
})

export const eddsaFacts = [
  mf.value(
    'generate-keys-options',
    [
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
    {
      title: 'generate_keys 的選項',
      topics: ['cli'],
      verify: {
        probe: { kind: 'hash', anchor: 'that key will be used and not overridden', hash: 'sha256:ae030f7a799a2e46' },
        verifiedOn: '2.10.0',
        screenedThrough: '2.10.0',
      },
      note: '讀 2.10.0 的原始碼。`value` 是預設值或參數名，null 表示不帶值。鑰匙圈項目的標籤是 `Private key for signing Sparkle updates`',
    },
  ),
]
