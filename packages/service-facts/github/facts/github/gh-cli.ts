import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'github',
  topics: ['gh-cli'],
  source: { kind: 'observed', basis: 'measured', fetched: '2026-11-05' },
})

export const ghCliFacts = [
  mf.statement(
    'gh-pr-checks-exit-status',
    "`gh pr checks` 的結束碼：全部檢查通過是 0，有檢查失敗是 1（stdout 照常印出檢查），有檢查還在跑（pending）是 8。PR 沒有任何檢查時也是結束碼 1，但 stdout 空白，stderr 印 `no checks reported on the '<branch>' branch`。加 `--required` 而 PR 沒有必要檢查時，stderr 改印 `no required checks reported on the '<branch>' branch`。所以只看結束碼 1 分不出「檢查失敗」「沒有檢查」與其他錯誤（例如 token 缺 `actions: read`，同樣是結束碼 1 且 stdout 空白），要靠 stdout 與 stderr 分",
    {
      title: 'gh pr checks 的結束碼與沒有檢查時的輸出',
      topics: ['pr', 'checks', 'exit-code'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            "執行 `gh pr checks <沒有任何檢查的 PR 編號> --repo <owner/repo> --json name,bucket; echo rc=$?`。成立的條件是 stdout 空白、stderr 印 `no checks reported on the '<branch>' branch`、rc=1。結束碼 8 與失敗檢查的 1 看原始碼 https://github.com/cli/cli/blob/v2.97.0/pkg/cmd/pr/checks/checks.go 的 :74、:247-251、:301-308",
        },
        verifiedOn: '2026-11-05',
        screenedThrough: '2026-11-05',
      },
      note: "本機 gh 2.97.0 實測 `gh pr checks 1 --repo octocat/Hello-World --json name,bucket`，rc=1，stderr 是 `no checks reported on the 'patch-1' branch`。其餘結束碼與 `--required` 的文案讀自 cli/cli v2.97.0 的 pkg/cmd/pr/checks/checks.go（:74、:247-251、:301-308），沒有逐一實跑。文案是原始碼字串，gh 改版可能改，用它判斷時要把文案不符當成其他錯誤",
    },
  ),
]
