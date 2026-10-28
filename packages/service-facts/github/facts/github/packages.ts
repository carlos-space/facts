import { factsOf, observedDoc } from 'fact-kit'

const npmRegistryDoc =
  'https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry'
const accessDoc =
  'https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility'
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
]
