import { factsOf, observedDoc } from 'fact-kit'

const npmRegistryDoc =
  'https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry'
const accessDoc =
  'https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility'
const permissionsDoc =
  'https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages'
const actionsDoc =
  'https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions'

const mf = factsOf({
  tool: 'github',
  topics: ['packages'],
  source: observedDoc({ url: npmRegistryDoc, fetched: '2026-10-29' }),
})

export const packagesFacts = [
  mf.statement(
    'packages-npm-scoped-name',
    'GitHub Packages 的 npm registry 只支援有 scope 的套件，名稱格式是 `@NAMESPACE/PACKAGE-NAME`，NAMESPACE 是套件所屬的個人帳號或組織。scope 與套件名只能用小寫字母',
    {
      title: 'GitHub Packages npm 套件名要帶 scope',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'GitHub Packages only supports scoped npm packages',
          hash: 'sha256:422600694e9636ab',
        },
        verifiedOn: '2026-10-29',
        screenedThrough: '2026-10-29',
      },
    },
  ),
  mf.statement(
    'packages-default-private',
    '套件第一次發布到 GitHub Packages 時，預設可見度是 private。連結倉庫的套件預設繼承倉庫的存取權限，但不繼承可見度，要改可見度得到套件設定改',
    {
      title: '套件預設不公開',
      topics: ['visibility'],
      verify: {
        probe: {
          kind: 'hash',
          url: accessDoc,
          anchor: 'inherits the access permissions (but not the visibility)',
          hash: 'sha256:c545e6d1e0f117d0',
        },
        verifiedOn: '2026-10-29',
        screenedThrough: '2026-10-29',
      },
      note: `${npmRegistryDoc} 也寫 "When you first publish a package, the default visibility is private." 另一段講沒有細部權限的 registry，寫 repository-scoped 套件繼承倉庫的權限與可見度，npm registry 支援細部權限，所以不適用`,
      source: observedDoc({ url: accessDoc, fetched: '2026-10-29' }),
    },
  ),
  mf.statement(
    'packages-token-permission',
    '在 GitHub Actions workflow 用 `GITHUB_TOKEN` 發布套件時，要在 workflow 檔的 `permissions` 給 `packages: write`（官方建議 `contents: read` 加 `packages: write`）',
    {
      title: 'GITHUB_TOKEN 發布套件的權限',
      topics: ['actions', 'token'],
      verify: {
        probe: {
          kind: 'hash',
          url: actionsDoc,
          anchor: 'write access for the packages scope',
          hash: 'sha256:046c805a6c75c34b',
        },
        verifiedOn: '2026-10-29',
        screenedThrough: '2026-10-29',
      },
      note: '官方文字是「在 workflow 檔設定 token 的權限，授 contents 讀、packages 寫」，範例寫 `permissions: packages: write`。該段上下文講沒有細部權限的 registry，npm registry 屬細部權限，官方沒有針對 npm 另寫這個權限，這裡是套用同一段的建議',
      source: observedDoc({ url: actionsDoc, fetched: '2026-10-29' }),
    },
  ),
  mf.statement(
    'packages-cross-repo-access',
    '倉庫的 workflow 要存取別的倉庫（或帳號）名下的套件，需要在套件設定的「Manage Actions access」加入該 workflow 所在的倉庫，並選存取角色',
    {
      title: '跨倉庫存取套件要授權',
      topics: ['actions', 'access'],
      verify: {
        probe: {
          kind: 'hash',
          url: accessDoc,
          anchor: 'you must add the repository where the workflow is stored',
          hash: 'sha256:78242be69d6e23cf',
        },
        verifiedOn: '2026-10-29',
        screenedThrough: '2026-10-29',
      },
      note: `${actionsDoc} 也寫 "you must add the repository where the workflow is stored to your package." 寫入權限的角色名稱官方頁沒細列`,
      source: observedDoc({ url: accessDoc, fetched: '2026-10-29' }),
    },
  ),
  mf.statement(
    'packages-npm-scope-registry',
    '從 GitHub Packages 安裝 scoped npm 套件，要在專案的 `.npmrc` 寫 `@NAMESPACE:registry=https://npm.pkg.github.com`，把該 scope 的安裝請求導到 GitHub Packages。NAMESPACE 是套件所屬的個人帳號或組織。要用多個 NAMESPACE 的套件，各加一行',
    {
      title: 'npm scope 要指到 GitHub Packages registry',
      topics: ['install'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'line specifying GitHub Packages URL and the namespace where the package is hosted',
          hash: 'sha256:f9bf14128aa4f4a0',
        },
        verifiedOn: '2026-10-30',
        screenedThrough: '2026-10-30',
      },
      source: observedDoc({ url: npmRegistryDoc, fetched: '2026-10-30' }),
    },
  ),
  mf.statement(
    'packages-npm-auth-token-line',
    '用 `.npmrc` 認證 GitHub Packages 的 npm registry，要寫 `//npm.pkg.github.com/:_authToken=TOKEN`，TOKEN 是 personal access token (classic)。官方範例寫在 `~/.npmrc`',
    {
      title: 'npm 認證 GitHub Packages 的 .npmrc 設定行',
      topics: ['install', 'token'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: '//npm.pkg.github.com/:_authToken=TOKEN',
          hash: 'sha256:5ce65a2e02ab0894',
        },
        verifiedOn: '2026-10-30',
        screenedThrough: '2026-10-30',
      },
      source: observedDoc({ url: npmRegistryDoc, fetched: '2026-10-30' }),
    },
  ),
  mf.statement(
    'packages-npm-pat-classic-only',
    'GitHub Packages 只支援用 personal access token (classic) 認證。發布、安裝與刪除私有、內部與公開套件都需要 access token',
    {
      title: 'GitHub Packages 只收 PAT (classic)',
      topics: ['token'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'GitHub Packages only supports authentication using a personal access token (classic)',
          hash: 'sha256:94ac2075dbc4b03b',
        },
        verifiedOn: '2026-10-30',
        screenedThrough: '2026-10-30',
      },
      note: '同一頁另寫在 GitHub Actions workflow 內可用 `GITHUB_TOKEN` 發布與該倉庫關聯的套件，發布權限見 packages-token-permission。官方頁沒有提到 gh CLI 的 OAuth token',
      source: observedDoc({ url: npmRegistryDoc, fetched: '2026-10-30' }),
    },
  ),
  mf.statement(
    'packages-pat-read-scope',
    '用 personal access token (classic) 從 GitHub Packages 下載與安裝套件，token 要有 `read:packages` scope，帳號對該套件要有 read 權限',
    {
      title: '安裝套件的 PAT scope',
      topics: ['token', 'install'],
      verify: {
        probe: {
          kind: 'hash',
          url: permissionsDoc,
          anchor: 'Download and install packages from GitHub Packages',
          hash: 'sha256:a662aff73ad5bcf1',
        },
        verifiedOn: '2026-10-30',
        screenedThrough: '2026-10-30',
      },
      note: '官方文字是「從倉庫下載與安裝套件，token 要有 read:packages scope，帳號要有 read 權限」，沒有只限私有套件。npm registry 頁另寫 Actions 內安裝其他私有倉庫的套件，要 PAT (classic) 至少有 read:packages',
      source: observedDoc({ url: permissionsDoc, fetched: '2026-10-30' }),
    },
  ),
  mf.statement(
    'packages-pat-write-scope',
    '用 personal access token (classic) 上傳與發布套件到 GitHub Packages，token 要有 `write:packages` scope，需要的權限是 write',
    {
      title: '發布套件的 PAT scope',
      topics: ['token', 'publish'],
      verify: {
        probe: {
          kind: 'hash',
          url: permissionsDoc,
          anchor: 'Upload and publish packages to GitHub Packages',
          hash: 'sha256:dd2253a2e50c2a7e',
        },
        verifiedOn: '2026-10-30',
        screenedThrough: '2026-10-30',
      },
      note: 'Actions 內用 `GITHUB_TOKEN` 發布的權限另計，見 packages-token-permission',
      source: observedDoc({ url: permissionsDoc, fetched: '2026-10-30' }),
    },
  ),
  mf.statement(
    'packages-npm-gh-oauth-token-rejected',
    'gh CLI 的 OAuth token（`gho_` 開頭）用在 GitHub Packages 的 npm registry 會回 401，不能代替 personal access token (classic)',
    {
      title: 'gh CLI OAuth token 對 npm registry 回 401',
      topics: ['token', 'install'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '取 `gh auth token`（`gho_` 開頭）寫進 `//npm.pkg.github.com/:_authToken=`，用 `@<scope>:registry=https://npm.pkg.github.com` 對一個 scoped 套件跑 `npm view` 或 `npm install`。成立的條件是回 401。再換成有 `read:packages` 的 PAT (classic) 同一指令應成功',
        },
        verifiedOn: '2026-10-30',
        screenedThrough: '2026-10-30',
      },
      note: '2026-10-30 本機實測，n=1，只測一個 gho_ token 與一個套件。官方文件只寫 GitHub Packages 只支援 PAT (classic)（見 packages-npm-pat-classic-only），沒有直接寫 OAuth token 會回 401，所以這筆是實測，不是文件',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-30' },
    },
  ),
]
