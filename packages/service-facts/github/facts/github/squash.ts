import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'github',
  topics: ['squash'],
  source: observedDoc({ url: 'https://docs.github.com/en/rest/repos/repos', fetched: '2026-09-29' }),
})

export const squashFacts = [
  mf.statement(
    'squash-merge-message',
    '`squash_merge_commit_title` 可設 `PR_TITLE` 或 `COMMIT_OR_PR_TITLE`，後者在 PR 只有一個 commit 時取該 commit 的標題。`squash_merge_commit_message` 可設 `PR_BODY`，讓 PR 內文結尾的 trailer 落進 commit。沒有設定時，平台的行為與 `COMMIT_OR_PR_TITLE` 相同',
    {
      title: 'squash 合併的訊息',
      topics: ['merge'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Required when using squash_merge_commit_message',
          hash: 'sha256:557954ae413d1f33',
        },
        verifiedOn: '2026-09-29',
        screenedThrough: '2026-09-29',
      },
    },
  ),
  mf.statement(
    'squash-default-message',
    '沒有另外設定時，squash 合併預設的訊息是：PR 只有一個 commit 時取該 commit 的標題與訊息，兩個以上時取 PR 標題加 commit 清單',
    {
      title: 'squash 合併的預設訊息',
      topics: ['merge', 'commit'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'or the pull request title and list of commits',
          hash: 'sha256:9a2e0f01e59ce063',
        },
        verifiedOn: '2026-09-30',
        screenedThrough: '2026-09-30',
      },
      source: observedDoc({
        url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests',
        fetched: '2026-09-30',
      }),
    },
  ),
]
