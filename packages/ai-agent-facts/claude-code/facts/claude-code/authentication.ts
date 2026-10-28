import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['authentication'],
  source: observedDoc({
    url: 'https://code.claude.com/docs/en/authentication.md#generate-a-long-lived-token',
    fetched: '2026-10-21',
  }),
})

export const authenticationFacts = [
  mf.statement(
    'setup-token-oauth-env',
    '`claude setup-token` 開啟與 `/login` 相同的瀏覽器授權流程，核可後把權杖印在終端機、不寫進任何檔案。把它設成 CLAUDE_CODE_OAUTH_TOKEN 環境變數即可用該訂閱身分認證於一年內有效，但 --bare 模式不會讀取這個環境變數。',
    {
      topics: ['oauth'],
      verify: {
        probe: { kind: 'hash', anchor: 'does not save the token anywhere', hash: 'sha256:ad0ecfe6f1c50f09' },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
    },
  ),
]
