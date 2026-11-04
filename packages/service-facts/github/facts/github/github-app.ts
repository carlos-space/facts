import { factsOf, observedDoc } from 'fact-kit'

const tokenDoc =
  'https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app'
const jwtDoc =
  'https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app'
const restAppsDoc = 'https://docs.github.com/en/rest/apps/apps'

const mf = factsOf({
  tool: 'github',
  topics: ['github-app'],
  source: observedDoc({ url: tokenDoc, fetched: '2026-11-04' }),
})

export const githubAppFacts = [
  mf.statement(
    'app-installation-token-expiry',
    'GitHub App 的 installation access token 在發出後 1 小時到期。到期後要用 App JWT 重新建立一個，舊 token 不能續期',
    {
      title: 'installation access token 1 小時到期',
      topics: ['token'],
      verify: {
        probe: {
          kind: 'hash',
          url: tokenDoc,
          anchor: 'The installation access token will expire after 1 hour',
          hash: 'sha256:1c17d4237adc84bb',
        },
        verifiedOn: '2026-11-04',
        screenedThrough: '2026-11-04',
      },
      note: '官方文字只寫 "The installation access token will expire after 1 hour."，「不能續期」是從該文只有「用 JWT 呼叫 access_tokens 端點建立」這一條取得方式推得',
    },
  ),
  mf.statement(
    'app-jwt-iss',
    'GitHub App 的 JWT 的 `iss`（issuer）claim 可以是 App 的 client ID 或 app ID，官方建議用 client ID',
    {
      title: 'App JWT 的 iss 用 client ID 或 app ID',
      topics: ['jwt'],
      verify: {
        probe: {
          kind: 'hash',
          url: jwtDoc,
          anchor: 'Use of the client ID is recommended',
          hash: 'sha256:e96a0ba1c678d2e0',
        },
        verifiedOn: '2026-11-04',
        screenedThrough: '2026-11-04',
      },
      source: observedDoc({ url: jwtDoc, fetched: '2026-11-04' }),
    },
  ),
  mf.statement(
    'app-repo-installation-endpoint',
    '用 App JWT 呼叫 `GET /repos/{owner}/{repo}/installation`，取得該倉庫的 installation（回應的 `id` 就是 installation id）。這個端點只接受 JWT',
    {
      title: '用倉庫路徑查 installation',
      topics: ['installation', 'rest'],
      verify: {
        probe: {
          kind: 'hash',
          url: restAppsDoc,
          anchor: 'Enables an authenticated GitHub App to find the repository',
          hash: 'sha256:ed8f3692fa045431',
        },
        verifiedOn: '2026-11-04',
        screenedThrough: '2026-11-04',
      },
      note: '官方文字是 "Enables an authenticated GitHub App to find the repository\'s installation information." 與 "You must use a JWT to access this endpoint."。回應的 `id` 是 installation id，這句由 installation 物件的欄位推得，官方這段沒有逐字寫',
      source: observedDoc({ url: restAppsDoc, fetched: '2026-11-04' }),
    },
  ),
  mf.statement(
    'app-installation-token-repositories',
    '建立 installation access token（`POST /app/installations/{installation_id}/access_tokens`）時，請求內文可用 `repositories`（倉庫名稱陣列）或 `repository_ids`（倉庫 id 陣列）限定 token 能存取的倉庫。兩者都不給時，token 可存取該 installation 被授權的全部倉庫。token 不能存取 installation 本來就沒被授權的倉庫',
    {
      title: '建立 installation token 時限定倉庫',
      topics: ['token', 'installation'],
      verify: {
        probe: {
          kind: 'hash',
          url: tokenDoc,
          anchor: 'to specify individual repositories that the installation access token can access',
          hash: 'sha256:52b0031fbdab1c72',
        },
        verifiedOn: '2026-11-04',
        screenedThrough: '2026-11-04',
      },
    },
  ),
]
