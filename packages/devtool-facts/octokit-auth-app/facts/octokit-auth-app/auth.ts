import { factsOf } from 'fact-kit'

const base = 'https://github.com/octokit/auth-app.js/blob/v8.3.1'

const mf = factsOf({
  tool: 'octokit-auth-app',
  topics: ['auth'],
  source: { kind: 'observed', basis: 'doc', url: `${base}/README.md`, fetched: '2026-11-04' },
})

export const authFacts = [
  mf.statement(
    'installation-token-cache-ttl',
    '`@octokit/auth-app` 預設把 installation token 快取 59 分鐘。GitHub 的 token 有效 60 分鐘，套件提早 1 分鐘讓快取失效，用來吸收請求延遲。快取期間內用同一組 `installationId` 取 token，拿到的是快取的 token，不會再呼叫 GitHub',
    {
      title: 'installation token 預設快取 59 分鐘',
      topics: ['installation-token', 'cache'],
      verify: {
        probe: {
          kind: 'hash',
          url: `${base}/README.md`,
          anchor: 'This library invalidates them after 59 minutes',
          hash: 'sha256:84cc01cfdcc67043',
        },
        verifiedOn: '8.3.1',
        screenedThrough: '8.3.1',
      },
      note: `README.md:1424 "Installation access tokens are valid for 60 minutes. This library invalidates them after 59 minutes to account for request delays." 程式在 src/cache.ts:17 的 \`1000 * 60 * 59\`（發布檔 dist-src/cache.js:7），上一行註解寫 "Cache for 1 minute less than GitHub expiry"。版本 8.3.1`,
    },
  ),
  mf.statement(
    'installation-token-refresh',
    '`auth({ type: "installation", installationId, refresh: true })` 跳過快取，直接向 GitHub 換一個新的 installation token，並更新該 `installationId` 的快取。`refresh` 預設是 `false`',
    {
      title: 'refresh: true 跳過快取換新 token',
      topics: ['installation-token', 'cache'],
      verify: {
        probe: {
          kind: 'hash',
          url: `${base}/README.md`,
          anchor: 'set `refresh` to `true`',
          hash: 'sha256:fe0a5ba8c7c74557',
        },
        verifiedOn: '8.3.1',
        screenedThrough: '8.3.1',
      },
      note: `README.md:664 "To bypass and update a cached token for the given \`installationId\`, set \`refresh\` to \`true\`. Defaults to \`false\`." 程式在 src/get-installation-authentication.ts:71 的 \`if (!options.refresh)\`，只有 refresh 不為真才讀快取（發布檔 dist-src/get-installation-authentication.js:40）。版本 8.3.1`,
    },
  ),
  mf.statement(
    'repository-names',
    '`auth()` 的 `repositoryNames` 選項（字串陣列）限定 installation token 能存取的倉庫，套件把它放進建立 token 請求的 `repositories` 欄位。官方建議限定範圍時優先用 `repositoryIds`，因為倉庫名稱可能改變。`repositoryIds` 與 `repositoryNames` 只給其中一個，不要同時給',
    {
      title: 'repositoryNames 限定 token 可用的倉庫',
      topics: ['installation-token', 'repositories'],
      verify: {
        probe: {
          kind: 'hash',
          url: `${base}/README.md`,
          anchor: 'The name of the repositories that the installation token can access',
          hash: 'sha256:e6486c6d36c128e4',
        },
        verifiedOn: '8.3.1',
        screenedThrough: '8.3.1',
      },
      note: `README.md:607-613 說明 \`repositoryNames\`，README.md:602 說明 \`repositoryIds\` 比 \`repositoryNames\` 更建議。程式在 src/get-installation-authentication.ts:118 的 \`repositories: options.repositoryNames\`（發布檔 dist-src/get-installation-authentication.js:79-82）。版本 8.3.1`,
    },
  ),
  mf.statement(
    'app-id-accepts-client-id',
    '`createAppAuth` 的 `appId` 選項型別是 `number | string`，除了 app ID，也可以傳 GitHub App 的 client ID 字串，官方建議傳 client ID',
    {
      title: 'appId 可傳 client ID',
      topics: ['options'],
      verify: {
        probe: {
          kind: 'hash',
          url: `${base}/README.md`,
          anchor: 'A Client ID string may also be used and is recommended',
          hash: 'sha256:cc3bfa3d05297bac',
        },
        verifiedOn: '8.3.1',
        screenedThrough: '8.3.1',
      },
      note: `README.md:363 "Find App ID on the app's about page in settings. A Client ID string may also be used and is recommended." 型別在 src/types.ts:24 的 \`appId: number | string\`（發布檔 dist-types/types.d.ts:18）。版本 8.3.1`,
    },
  ),
]
