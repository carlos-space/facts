import { factsOf } from 'fact-kit'

const mf = factsOf({ tool: 'launchd', topics: ['launchd'], source: { kind: 'observed', basis: 'measured' } })

const MEASURED_NOTE =
  'macOS 27.0.1（26A434），gui/<uid> 網域的假 LaunchAgent，程式只記錄收到的訊號與時間後空轉。n=1，只測 gui 網域，system 網域的 LaunchDaemon 沒測'

export const stopFacts = [
  mf.statement(
    'exit-timeout-cap',
    'gui 網域的 LaunchAgent 生效的 exit timeout 上限是 60 秒。plist 的 `ExitTimeOut` 寫 60 以下照寫的值生效，寫超過 60 時一律變成 60。生效值看 `launchctl print gui/<uid>/<label>` 的 `exit timeout` 列，例如寫 30 顯示 30，寫 120 或 1900 都顯示 60',
    {
      title: 'gui 網域 ExitTimeOut 的上限',
      topics: ['stop'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '寫一個 gui 網域的 LaunchAgent，`ExitTimeOut` 依序設 30、120、1900，每次 `launchctl bootout` 後再 `launchctl bootstrap gui/$(id -u) <plist>`，看 `launchctl print gui/$(id -u)/<label>` 的 `exit timeout`。成立的條件是三次分別顯示 30、60、60',
        },
        verifiedOn: '27.0.1',
      },
      note: MEASURED_NOTE,
      source: { kind: 'observed', basis: 'measured', fetched: '2026-11-05' },
    },
  ),
  mf.statement(
    'stop-sigkill-after-exit-timeout',
    '`launchctl stop` 對 job 的程序送 SIGTERM，程序在生效的 exit timeout 內沒有結束時，launchd 改送 SIGKILL。gui 網域的 exit timeout 最多 60 秒（見 `launchd.exit-timeout-cap`），所以程序收到 `launchctl stop` 後最多再跑 60 秒',
    {
      title: 'launchctl stop 逾時後送 SIGKILL',
      topics: ['stop'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '讓上面的 LaunchAgent 忽略 SIGTERM 並記錄收到的時間，跑 `launchctl stop <label>`，記錄程序消失的時間。成立的條件是從收到 SIGTERM 到程序消失約等於 `exit timeout`（實測 02:17:12 收到、02:18:13 消失）',
        },
        verifiedOn: '27.0.1',
      },
      note: MEASURED_NOTE,
      source: { kind: 'observed', basis: 'measured', fetched: '2026-11-05' },
    },
  ),
  mf.statement(
    'external-sigterm-no-exit-timeout',
    '不經過 launchctl、直接對 job 的程序送 SIGTERM（例如 `kill -TERM <pid>`、`pkill -TERM`）時，launchd 不套用 exit timeout，也不送 SIGKILL，程序自己結束前一直在跑',
    {
      title: '直接送 SIGTERM 時 launchd 不介入',
      topics: ['stop'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '同一個忽略 SIGTERM 的 LaunchAgent，`exit timeout` 為 60，直接 `kill -TERM <pid>`，等 90 秒。成立的條件是 90 秒後程序仍在（實測 02:18:41 送出、02:20:13 仍在）',
        },
        verifiedOn: '27.0.1',
      },
      note: MEASURED_NOTE,
      source: { kind: 'observed', basis: 'measured', fetched: '2026-11-05' },
    },
  ),
]
