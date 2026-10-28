import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'npm',
  topics: ['authentication'],
  source: observedDoc({ url: 'https://docs.npmjs.com/trusted-publishers', fetched: '2026-10-02' }),
})

export const authenticationFacts = [
  mf.statement(
    'npm-trusted-publishing-runner',
    'Trusted Publishing 目前只支援雲端託管的 runner。在 GitHub Actions 上要用 GitHub 託管的 runner，self-hosted runner 還不支援',
    {
      title: 'Trusted Publishing 的 runner',
      topics: ['actions'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Trusted publishing currently supports only cloud-hosted runners',
          hash: 'sha256:69b40d4f87598b74',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
  mf.statement(
    'npm-trusted-publishing-caller',
    '用 `workflow_call` 呼叫另一個執行 `npm publish` 的 workflow 時，驗證比對的是呼叫端 workflow 的名稱，不是含發布指令的 workflow。`id-token: write` 權限要同時給呼叫端與被呼叫端',
    {
      title: '由別的 workflow 呼叫發布',
      topics: ['actions'],
      verify: {
        probe: {
          kind: 'hash',
          anchor:
            "validation checks the calling workflow's name instead of the workflow that actually contains the publish command",
          hash: 'sha256:caf011a85220ea8a',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
  mf.statement(
    'npm-trusted-publishing-workflow-filename',
    '在 npm 登記 GitHub Actions 的 Trusted Publisher 時，填的是 workflow 檔名，例如 `publish.yml`。只填檔名不填路徑，要含副檔名，Environment 名稱可留空',
    {
      title: 'Trusted Publisher 登記的 workflow',
      topics: ['actions'],
      verify: {
        probe: { kind: 'hash', anchor: 'Enter only the filename, not the full path', hash: 'sha256:94d3edb27856a692' },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
    },
  ),
]
