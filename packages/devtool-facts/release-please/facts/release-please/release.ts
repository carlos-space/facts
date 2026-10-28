import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'release-please',
  topics: ['release'],
  source: observedDoc({
    url: 'https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md',
    fetched: '2026-09-29',
  }),
})

export const releaseFacts = [
  mf.statement('release-as-version', 'commit 內文有 `Release-As: x.y.z` 時，下一個發版 PR 用指定的版號', {
    title: '指定版號',
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Release Please will open a new pull request for the specified version',
        hash: 'sha256:3f5dbf3ee59ddb1b',
      },
      verifiedOn: '2026-09-29',
      screenedThrough: '2026-09-29',
    },
    source: observedDoc({
      url: 'https://github.com/googleapis/release-please/blob/main/README.md',
      fetched: '2026-09-29',
    }),
  }),
  mf.statement(
    'initial-version',
    'manifest 填入套件目前的版號，或以 `initial-version` 指定第一次發布的版號。都沒有時由工具的預設起算',
    {
      title: '起始版號',
      topics: ['version'],
      verify: {
        probe: {
          kind: 'hash',
          url: 'https://github.com/googleapis/release-please/blob/main/schemas/config.json',
          anchor: 'Releases the initial library with a specified version',
          hash: 'sha256:c2178460e568035d',
        },
        verifiedOn: '2026-09-29',
        screenedThrough: '2026-09-29',
      },
      note: 'https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md、https://github.com/googleapis/release-please/blob/main/schemas/config.json',
    },
  ),
  mf.statement('commit-to-package', 'manifest 模式依 `packages` 設定的路徑，把 commit 改到的檔案歸給各單元', {
    title: 'commit 歸給哪個單元',
    topics: ['monorepo'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'exclude commits from that path from processing',
        hash: 'sha256:8a19e07614bf93db',
      },
      verifiedOn: '2026-09-29',
      screenedThrough: '2026-09-29',
    },
  }),
  mf.statement(
    'commit-to-every-unit',
    '一個 commit 改到幾個單元的路徑，就算進幾個單元，每個單元依 commit 的 type 各自升版',
    {
      title: '跨單元的 commit',
      topics: ['monorepo'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Helper class for splitting commits by component path',
          hash: 'sha256:ecf8fc0cbf3cbde1',
        },
        verifiedOn: '2026-10-01',
        screenedThrough: '2026-10-01',
      },
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/main/src/util/commit-split.ts',
        fetched: '2026-10-01',
      }),
    },
  ),
  mf.statement(
    'commit-override-squash',
    'PR 合併後，在 PR 內文加覆寫區塊，可以改寫變更記錄用的 commit 訊息。區塊以 `BEGIN_COMMIT_OVERRIDE` 開頭、`END_COMMIT_OVERRIDE` 結尾。只在 squash 合併時有效，一般合併無效',
    {
      title: '修正已合併的變更記錄',
      topics: ['changelog'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'This feature will not work with plain merges',
          hash: 'sha256:78b81309ff0b3049',
        },
        verifiedOn: '2026-10-01',
        screenedThrough: '2026-10-01',
      },
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/main/README.md',
        fetched: '2026-10-01',
      }),
    },
  ),
  mf.statement(
    'peer-dependencies',
    '`node-workspace` 連動升版時預設不更新 `peerDependencies`，要開 `updatePeerDependencies` 才會',
    {
      title: 'peer 相依',
      topics: ['peer-dependency'],
      verify: {
        probe: { kind: 'hash', anchor: "doesn't modify `peerDependencies` fields", hash: 'sha256:9715de40d869ca26' },
        verifiedOn: '2026-09-29',
        screenedThrough: '2026-09-29',
      },
    },
  ),
  mf.statement('release-pr-updates', '發版 PR 會隨新的合併持續更新', {
    title: '發版 PR 的更新',
    topics: ['pull-request'],
    verify: {
      probe: { kind: 'hash', anchor: 'kept up-to-date as additional work is merged', hash: 'sha256:450605a62b66718e' },
      verifiedOn: '2026-09-29',
      screenedThrough: '2026-09-29',
    },
    source: observedDoc({
      url: 'https://github.com/googleapis/release-please/blob/main/README.md',
      fetched: '2026-09-29',
    }),
  }),
  mf.statement('release-as-changelog', '帶 `Release-As:` 的 commit 本身也會出現在變更記錄', {
    title: '`Release-As:` 的變更記錄',
    topics: ['changelog'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Release-As commits should appear in the changelog correctly',
        hash: 'sha256:ad91fc2a1e57d986',
      },
      verifiedOn: '2026-09-29',
      screenedThrough: '2026-09-29',
    },
    source: observedDoc({ url: 'https://github.com/googleapis/release-please/pull/1220', fetched: '2026-09-29' }),
  }),
  mf.statement(
    'prerelease-strategy',
    '`prerelease` 版本策略在目前版號是正式版時，把 `prerelease-type` 原樣當預發布後綴。例如 `1.3.1` 加一個 feat，`prerelease-type` 是 `alpha.1`，得 `1.4.0-alpha.1`。目前已是預發布版時只遞增序號，不讀 `prerelease-type`。破壞性變更讓不在 `X.0.0` 的預發布版跳到下一個 major，後綴沿用',
    {
      title: '預發布的版本策略',
      topics: ['version'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'This versioning strategy will increment the pre-release number for patch',
          hash: 'sha256:1d1a1ab8e599dd23',
        },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/v17.6.0/src/versioning-strategies/prerelease.ts',
        fetched: '2026-10-02',
      }),
    },
  ),
  mf.statement(
    'release-as-overrides-strategy',
    '`Release-As:` 指定的版號直接採用，不經版本策略，可以帶預發布後綴。之後的 fix 從這個版號接著遞增序號',
    {
      title: '`Release-As:` 與版本策略',
      topics: ['version'],
      verify: {
        probe: { kind: 'hash', anchor: 'from release-as configuration', hash: 'sha256:dfda91e3ef07274b' },
        verifiedOn: '2026-10-02',
        screenedThrough: '2026-10-02',
      },
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/v17.6.0/src/strategies/base.ts',
        fetched: '2026-10-02',
      }),
    },
  ),
  mf.statement(
    'package-level-overrides',
    '`packages` 底下的每個套件可以各自設 `versioning`、`prerelease-type`、`release-as`。套件有設就用套件的值，沒設才用頂層的值。例如頂層設 `prerelease` 版本策略，某個套件不設，該套件用頂層的值',
    {
      title: '套件層逐項覆寫',
      topics: ['monorepo', 'version'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'prereleaseType: pathConfig.prereleaseType ?? defaultConfig.prereleaseType',
          hash: 'sha256:1e73e8e2a8895b77',
        },
        verifiedOn: '2026-10-27',
        screenedThrough: '2026-10-27',
      },
      note: 'release-please 17.11.2（npm latest）。讀原始碼，並用該版的 `Manifest.fromManifest` 與 `buildStrategy` 實跑確認：兩個套件設 `versioning: prerelease` 加 `prerelease-type: alpha` 得 `1.2.0-alpha`，沒設的套件得 `1.2.0`，設 `release-as: 2.0.0` 的套件得 `2.0.0`',
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/v17.11.2/src/manifest.ts',
        fetched: '2026-10-27',
      }),
    },
  ),
  mf.statement(
    'config-unknown-keys',
    '設定檔的未知鍵在執行期被丟掉，不會讀也不會報錯。`schemas/config.json` 的頂層設 `additionalProperties: false`，所以頂層未知鍵會讓用 schema 驗證的編輯器報錯，套件層沒有這個限制',
    {
      title: '設定檔的未知鍵',
      topics: ['config'],
      verify: {
        probe: { kind: 'hash', anchor: 'Schema for defining manifest config file', hash: 'sha256:5ce7edf06a14ee70' },
        verifiedOn: '2026-10-27',
        screenedThrough: '2026-10-27',
      },
      note: 'release-please 17.11.2（npm latest）。讀原始碼，並用該版的 `Manifest.fromManifest` 與 `buildStrategy` 實跑確認：套件層加 `x-cadence` 與頂層加 `x-release-policy` 都不影響版號計算。schema 驗證的行為只讀 schema，沒實跑驗證器',
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/v17.11.2/schemas/config.json',
        fetched: '2026-10-27',
      }),
    },
  ),
  mf.statement(
    'linked-versions-max-version',
    '`linked-versions` 外掛先算出群組內每個套件各自的新版號，取其中最大的一個，用 `Release-As` 強制套給群組全員。群組內的套件不能一個留在預發布階段、另一個在正式版，因為最後全員都是最大那個版號',
    {
      title: 'linked-versions 群組的版號',
      topics: ['monorepo', 'version'],
      verify: {
        probe: { kind: 'hash', anchor: 'const primaryVersion = versions.reduce(', hash: 'sha256:18cdbf35c87c0e55' },
        verifiedOn: '2026-10-27',
        screenedThrough: '2026-10-27',
      },
      note: 'release-please 17.11.2（npm latest）。讀原始碼，並用該版的 `Manifest.fromManifest` 與 `buildStrategy` 實跑確認：`prerelease` 版本策略的 web 加 feat、預設策略的 facts 加 fix，兩者都得 `1.2.0-alpha`',
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/v17.11.2/src/plugins/linked-versions.ts',
        fetched: '2026-10-27',
      }),
    },
  ),
  mf.statement(
    'node-workspace-direction',
    '`node-workspace` 外掛在被依賴的套件升版時，讓相依方跟著升版，相依方用自己的版本策略算新版號，沒有策略時升 patch。沒有讓被依賴者跟著相依方階段的機制',
    {
      title: 'node-workspace 的連動方向',
      topics: ['monorepo', 'version'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'strategy.versioningStrategy.bump(version, [])',
          hash: 'sha256:4515dfa3fc3990d8',
        },
        verifiedOn: '2026-10-27',
        screenedThrough: '2026-10-27',
      },
      note: '讀 release-please 17.11.2 的 `bumpVersion` 原始碼，沒實跑連動。「沒有反向機制」是讀碼沒找到，不是實測',
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/v17.11.2/src/plugins/node-workspace.ts',
        fetched: '2026-10-27',
      }),
    },
  ),
  mf.statement(
    'default-strategy-prerelease-version',
    '沒設 `versioning: prerelease` 的套件，目前版號是預發布版時照一般規則升版，後綴原樣保留。例如 `1.2.0-alpha.2` 加一個 fix 得 `1.2.1-alpha.2`，不是 `1.2.0-alpha.3`。只改 `prerelease-type` 也不會換階段，要靠 `Release-As:` 指定版號',
    {
      title: '預設策略遇到預發布版號',
      topics: ['version'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '安裝 release-please 後，用 `buildStrategy({ releaseType: "simple", component: "web", github, path: "w", targetBranch: "main" })` 對目前版號 `1.2.0-alpha.2` 與一個 `fix: a` commit 呼叫 `buildReleasePullRequest`。成立的條件是新版號為 `1.2.1-alpha.2`',
        },
        verifiedOn: '17.11.2',
        screenedThrough: '17.11.2',
      },
      note: 'release-please 17.11.2（npm latest），用 `buildStrategy` 與 `parseConventionalCommits` 實跑。預設策略從 `1.2.0-alpha.2` 加 fix 得 `1.2.1-alpha.2`。`prerelease` 策略從 `1.2.0-alpha.2` 加 fix，即使 `prerelease-type` 改成 beta 也得 `1.2.0-alpha.3`。`release-please.prerelease-strategy` 只講 `prerelease` 策略，沒涵蓋預設策略',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-27' },
    },
  ),
  mf.statement(
    'prerelease-flag-github-release',
    '設定的 `prerelease` 欄位只決定建立的 GitHub Release 是否標成 prerelease，預設 `false`。它不決定版號的階段，階段由 `versioning` 與 `prerelease-type` 決定',
    {
      title: 'prerelease 欄位只標 GitHub Release',
      topics: ['config'],
      verify: {
        probe: { kind: 'hash', anchor: 'Create the GitHub release as prerelease', hash: 'sha256:9e9d837f938f8cb3' },
        verifiedOn: '2026-10-27',
        screenedThrough: '2026-10-27',
      },
      note: 'schema 的 `prerelease` 描述。「不決定版號階段」由 `release-please.default-strategy-prerelease-version` 的實跑佐證：只有 `versioning` 與 `prerelease-type` 影響版號',
      source: observedDoc({
        url: 'https://github.com/googleapis/release-please/blob/v17.11.2/schemas/config.json',
        fetched: '2026-10-27',
      }),
    },
  ),
]
