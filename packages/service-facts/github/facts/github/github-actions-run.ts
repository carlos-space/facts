import { factsOf, observedDoc } from 'fact-kit'

const workflowRunsDoc = 'https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2022-11-28'
const workflowJobsDoc = 'https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2022-11-28'

const mf = factsOf({
  tool: 'github',
  topics: ['actions-run'],
  source: observedDoc({ url: workflowRunsDoc, fetched: '2026-11-05' }),
})

export const githubActionsRunFacts = [
  mf.statement(
    'actions-job-status-values',
    'GitHub Actions 的 job（`GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` 回應的 `status`）可能是 `queued`、`in_progress`、`completed`、`waiting`、`requested`、`pending` 其中之一。只有 `in_progress` 表示 job 已被 runner 接走並在執行，其餘未完成的值（`queued`、`waiting`、`requested`、`pending`）都還沒開始執行',
    {
      title: 'job 的 status 值',
      topics: ['job', 'status'],
      verify: {
        probe: {
          kind: 'manual',
          reason: `開啟 ${workflowJobsDoc} 的 "List jobs for a workflow run" 回應 schema，成立的條件是 job 的 \`status\`（說明 "The phase of the lifecycle that the job is currently in."）enum 為 queued、in_progress、completed、waiting、requested、pending。這份 enum 只在頁面內嵌的 schema JSON，頁面可見文字沒有，所以不能用 hash 探針`,
        },
        verifiedOn: '2026-11-05',
        screenedThrough: '2026-11-05',
      },
      note: '「只有 in_progress 表示在執行」是從各值的字面意思與 queued 對應排隊推得，官方文件沒有逐值定義。發布腳本的 CI 閘依這句把「不是 in_progress」一律當排隊，所以將來新增的狀態值也有定義',
      source: observedDoc({ url: workflowJobsDoc, fetched: '2026-11-05' }),
    },
  ),
  mf.statement(
    'actions-run-status-query-values',
    'GitHub REST 的 list workflow runs（`GET /repos/{owner}/{repo}/actions/runs`）的 `status` 查詢參數可用值是 completed、action_required、cancelled、failure、neutral、skipped、stale、success、timed_out、in_progress、queued、requested、waiting、pending。這是查詢參數的可用值，不是回應欄位 `status` 的列舉，回應的 `status` 在官方文件只標 string。`gh run list --status` 的說明另多列 `startup_failure`',
    {
      title: 'run 的 status 查詢參數可用值',
      topics: ['run', 'status'],
      verify: {
        probe: {
          kind: 'hash',
          url: workflowRunsDoc,
          anchor: 'Only GitHub Actions can set a status of waiting',
          hash: 'sha256:5e4b0eaf3548f80f',
        },
        verifiedOn: '2026-11-05',
        screenedThrough: '2026-11-05',
      },
      note: '官方文字是 "Returns workflow runs with the check run status or conclusion that you specify. ... Only GitHub Actions can set a status of waiting, pending, or requested. Can be one of: completed, action_required, ..."。`startup_failure` 讀自本機 gh 2.97.0 的 `gh run list --help`。回應欄位的值沒有官方列舉，要判斷 run 是否在排隊時不能假設回應只會出現這些值',
      source: observedDoc({ url: workflowRunsDoc, fetched: '2026-11-05' }),
    },
  ),
  mf.statement(
    'actions-run-started-at-ignores-queue',
    'GitHub Actions run 層級的 `run_started_at`（`gh run view --json startedAt`）不反映 job 的排隊。第一個 job 還在排隊時，run 的 `created_at` 與 `run_started_at` 已經是同一個時間，所以不能用 run 的 `startedAt` 減 `createdAt` 量排隊。要量排隊得看各 job 的開始時間與 run 的建立時間，例如 `gh api repos/{owner}/{repo}/actions/runs/{run_id}/jobs` 的 job `started_at`',
    {
      title: 'run 的 run_started_at 不反映排隊',
      topics: ['run', 'queue'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '執行 `gh api repos/carlos-space/blueprint-monorepo/actions/runs/41983388413 --jq "[.created_at,.run_started_at]"` 與 `gh run view 41983388413 --repo carlos-space/blueprint-monorepo --json jobs --jq ".jobs[0].startedAt"`。成立的條件是前者兩個時間相同，後者晚於它們',
        },
        verifiedOn: '2026-11-05',
        screenedThrough: '2026-11-05',
      },
      note: 'carlos-space/blueprint-monorepo 的 run 41983388413 實測，`created_at` 與 `run_started_at` 都是 2026-11-05T06:53:00Z，第一個 job（scope）到 07:04:58 才開始，排隊 717 秒。同一天 poly 系列 PR 的 57 筆 run，run 層級 `startedAt` 減 `createdAt` 全是 0',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-11-05' },
    },
  ),
  mf.statement(
    'gh-run-view-json-jobs-fields',
    '`gh run view <run-id> --json jobs` 交回 `jobs` 陣列，每個 job 有 `databaseId`、`name`、`status`、`conclusion`、`startedAt`、`completedAt`、`steps`、`url`。job 沒有 `createdAt` 欄位（`--jq ".jobs[0].createdAt"` 印出 null），所以從這個輸出量不到 job 排隊多久',
    {
      title: 'gh run view --json jobs 的 job 欄位',
      topics: ['gh-cli', 'job'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '執行 `gh run view 41983388413 --repo carlos-space/blueprint-monorepo --json jobs --jq ".jobs[0]|keys"`。成立的條件是輸出 ["completedAt","conclusion","databaseId","name","startedAt","status","steps","url"]，沒有 createdAt',
        },
        verifiedOn: '2026-11-05',
        screenedThrough: '2026-11-05',
      },
      note: '本機 gh 2.97.0 對 carlos-space/blueprint-monorepo 的 run 41983388413 實測，jobs[0] 的 keys 就是上面八個。`gh run view --help` 有 `--attempt` 旗標，沒有查證不帶旗標時取哪一次 attempt',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-11-05' },
    },
  ),
]
