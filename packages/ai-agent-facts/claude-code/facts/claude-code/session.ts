import { factsOf, observedDoc, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['session'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/cross-session-messaging.md', fetched: '2026-10-02' }),
})

export const sessionFacts = [
  mf.statement(
    'prompt-cache-ttl',
    '預設只有 Claude 訂閱方案在包含的用量內，主對話的快取存活 1 小時。子代理、壓縮等主對話以外的請求是 5 分鐘，超過方案用量後主對話也降為 5 分鐘。',
    {
      topics: ['timeout'],
      verify: {
        probe: { kind: 'hash', anchor: 'Unless you choose a TTL yourself', hash: 'sha256:016c5eb065f09386' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/prompt-caching', fetched: '2026-10-03' }),
    },
  ),
  mf.statement(
    'prompt-cache-lifetime',
    '快取從最後一次命中它的請求起算，閒置超過存活時間就過期。過期後的下一次請求要重新計算整段輸入。',
    {
      topics: ['timeout'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Each request that hits the cache resets the timer',
          hash: 'sha256:822fc71d3592d7dd',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/prompt-caching', fetched: '2026-10-03' }),
    },
  ),
  mf.statement(
    'session-id-env',
    '主會話的 Bash 工具子行程有環境變數 `CLAUDE_CODE_SESSION_ID`，值是會話 id，這場會話的對話紀錄就是 `~/.claude/projects/<專案>/<id>.jsonl`。以 `run_in_background` 執行的指令也讀得到這個變數。',
    {
      topics: ['environment'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在主會話用 Bash 印 $CLAUDE_CODE_SESSION_ID，確認 ~/.claude/projects/*/<id>.jsonl 存在；再用 run_in_background 跑 echo $CLAUDE_CODE_SESSION_ID。成立的條件是前景與背景都印出同一個會話 id，且對得到紀錄檔',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機桌面版互動會話，Claude Code 2.1.285，前景與背景的 Bash 子行程各實跑一次，變數值對得到紀錄檔（背景 n=1）',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-03' },
    },
  ),
  mf.statement(
    'autocompact-window-scope',
    '設定檔的 `autoCompactWindow` 是 100000 到 1000000 的 token 數，超過模型視窗時取模型視窗。`--autocompact` 優先於它，環境變數 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 優先於兩者。`/autocompact` 接受 `500k` 這種寫法，文件寫明自 2.1.288 起它存成各模型自己的值，同一個檔裡優先於這個鍵。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Claude Code caps the value at your model', hash: 'sha256:4a67f4bb72c3318a' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/settings-reference', fetched: '2026-10-03' }),
    },
  ),
  mf.statement(
    'autocompact-env-runtime',
    '`/autocompact` 只收 `auto` 或 100k 到 1M 的數字，`default` 與 `reset` 也寫成 `"auto"`。`clear` 回「Couldn\'t parse」錯誤，設定檔不變，所以沒有寫法能把各模型的值從設定檔移除。各模型的值是 `"auto"` 時，上限是模型預設，不用頂層的 `autoCompactWindow`。mod 的 `settings.read` hook 改寫回答，不影響 `/context` 與 `/autocompact` 用的上限。mod 用 `$.env.set` 設 `CLAUDE_CODE_AUTO_COMPACT_WINDOW`，在會話開始時或會話中途設定，都在下一次 `/context` 生效，`/autocompact` 標出來源是這個變數，設定檔不變。',
    {
      topics: ['environment', 'mod'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在隔離的設定目錄放頂層 autoCompactWindow 450000，依序實跑四組。第一組讓 /autocompact 帶 auto、default、reset、clear 各一次，看設定檔各模型的值。第二組把各模型的值設成 "auto"、null 與不設，各跑一次 /autocompact 看上限。第三組載入改寫各模型與頂層值的 settings.read hook，跑 /context。第四組載入在 session.start 用 $.env.set 設 300000、在 /context 後改成 250000 的 mod，跑兩次 /context。成立的條件是 auto、default、reset 都寫成 "auto"，"auto" 時上限是模型預設，settings.read 的改寫不改變 /context 的上限，環境變數兩次都在下一次 /context 生效而且設定檔不變',
        },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      note: '本機 headless stream-json 會話，CLAUDE_CONFIG_DIR 指向隔離的設定目錄。第一組、第二組的 "auto" 與不設、第三組、第四組都用 Claude Code 2.1.304，第二組的 null 用 2.1.292，各情境 n=1',
      source: observedSpike({ fetched: '2026-10-21' }),
    },
  ),
  mf.statement('cross-session-discovery', '`ListAgents` 列出可以傳訊的會話，`SendMessage` 用來傳訊。', {
    verify: {
      probe: { kind: 'hash', anchor: 'Claude discovers the target with', hash: 'sha256:36eed192879344a7' },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
  }),
  mf.statement(
    'cross-session-idle-notice',
    '`SendMessage` 的 `notify_when_idle` 讓對方下次閒置時送回一則通知，可以附在要傳的訊息上，也可以單獨送。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'send back one notice when that session next goes idle',
          hash: 'sha256:433dcacc4a8c3511',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement('cross-session-plain-text', '另一個會話的訊息以純文字送達。', {
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'A message from another session arrives as plain text',
        hash: 'sha256:a94f8839641cfd30',
      },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
  }),
  mf.statement(
    'cross-session-delivery-turn',
    '等待的這一邊在自己這一輪結束前收不到閒置通知，通知在這一輪結束後才送達，成為新的一輪。閒置通知附對方最後一則回覆的摘要。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '另開一個終端機接收會話，這邊傳訊並帶 notify_when_idle，對方回覆後停下，這邊的這一輪繼續跑一陣再結束。成立的條件是這一輪還在跑時收不到通知，結束後通知才送達、成為新的一輪，並附對方最後一則回覆的摘要',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '協調端在 VS Code 擴充功能（Claude Code 2.1.286），受測會話是 headless stream-json 會話（Claude Code 2.1.285）',
      source: observedSpike({ fetched: '2026-10-02' }),
    },
  ),
  mf.statement(
    'list-agents-status',
    '`ListAgents` 每列有名稱、`[ref]`、類型與狀態，狀態分 idle、busy、waiting、offline。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在有其他會話開著時呼叫一次 ListAgents。成立的條件是每列有名稱、[ref]、類型與狀態，狀態值是 idle、busy、waiting、offline 其中之一',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless 會話，Claude Code 2.1.285',
      source: observedSpike({ fetched: '2026-10-02' }),
    },
  ),
  mf.statement(
    'list-agents-waiting',
    '實測中一場停在 waiting 的會話卡在 Edit 的權限確認，另一個會話傳訊之後它仍停在 waiting。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '讓一個終端機會話做一次要核准的 Edit 而不按同意，再從另一個會話呼叫 ListAgents 並傳訊給它。成立的條件是它顯示 waiting，傳訊後仍停在 waiting',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '協調端在 VS Code 擴充功能（Claude Code 2.1.286），受測會話是 headless stream-json 會話（Claude Code 2.1.285）',
      source: observedSpike({ fetched: '2026-10-02' }),
    },
  ),
  mf.statement(
    'cloud-session-infra',
    'Cloud Session 是跑在雲端基礎設施上、不在自己機器上的 Claude Code 會話，預設跑在 Anthropic 管理的設施。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor:
            'A cloud session is a Claude Code session that runs on cloud infrastructure instead of on your machine',
          hash: 'sha256:387602082b295ba1',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/claude-code-on-the-web.md', fetched: '2026-10-16' }),
    },
  ),
  mf.statement(
    'cloud-session-clone-branch',
    '`claude --cloud "<任務>"` 建立 Cloud Session。雲端 VM clone 的是目前目錄的 GitHub remote 在目前分支的內容，不是本機檔案，所以有本機 commit 要先 push。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: "clones your current directory's GitHub remote at your current branch",
          hash: 'sha256:78e2781c53ac6d43',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/claude-code-on-the-web.md', fetched: '2026-10-16' }),
    },
  ),
  mf.statement(
    'cloud-session-github-access',
    'Cloud Session 能讀的私有倉庫，限於裝了 Claude GitHub App 的倉庫，或用 `/web-setup` 送出的本機 `gh` token 讀得到的倉庫。其他私有倉庫讀不到。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'private repositories that the Claude GitHub App is installed on',
          hash: 'sha256:cc767b802b8766ed',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/claude-code-on-the-web.md', fetched: '2026-10-18' }),
    },
  ),
  mf.statement(
    'cloud-session-parallel',
    '每個 `claude --cloud` 指令都建立自己的 Cloud Session，各自獨立執行，可以同時跑多個。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'command creates its own cloud session that runs independently',
          hash: 'sha256:de9db4769c69f301',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/claude-code-on-the-web.md', fetched: '2026-10-16' }),
    },
  ),
  mf.statement(
    'remote-control-runs-local',
    'Remote Control 讓 claude.ai/code 或 Claude app 連到跑在自己機器上的會話。程式執行與檔案存取都留在那台機器。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Claude keeps running locally the entire time',
          hash: 'sha256:0f0e38f3185dcb31',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/remote-control.md', fetched: '2026-10-16' }),
    },
  ),
  mf.statement(
    'remote-control-start-command',
    '在要被遠端操作的那台機器的專案目錄執行 `claude remote-control`，就啟動 Remote Control。第一次會先問是否啟用，答 `y` 才啟動。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'In your project directory, run:', hash: 'sha256:584b52f43be819c0' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/remote-control.md', fetched: '2026-10-16' }),
    },
  ),
  mf.statement(
    'bg-session-cli',
    '`claude --bg --model <model> "<任務>"` 在背景開一場會話並印出會話 id，之後用 `claude logs <id>` 或 `claude attach <id>` 看它。沒帶 `--effort` 時用預設的 effort，權限模式沿用設定。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在 headless 會話放行 Bash(claude --bg:*) 後請模型執行 claude --bg --model sonnet 加一句簡單任務。成立的條件是印出 backgrounded 與會話 id，claude logs <id> 看得到指定的 model 與任務的回覆',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless 會話（claude -p，haiku）用 Bash 執行 `claude --bg --model sonnet`，Claude Code 2.1.285，背景會話是 Sonnet、effort high、auto mode，n=1',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-17' },
    },
  ),
  mf.statement(
    'bg-session-needs-approval',
    '模型用 Bash 執行 `claude --bg` 時要權限詢問。沒人回答的 headless 會話會被拒（`This command requires approval`），放行規則加 `Bash(claude --bg:*)` 後才執行。',
    {
      topics: ['permission'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在沒有放行規則的 headless 會話請模型執行 claude --bg。成立的條件是工具結果為 This command requires approval，且 permission_denials 有這一筆',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless 會話（claude -p，haiku，預設權限）用 Bash 執行 `claude --bg --model sonnet`，Claude Code 2.1.285，結果列在 permission_denials，n=1',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-17' },
    },
  ),
  mf.statement(
    'claude-code-transcript-internal-format',
    '對話紀錄 `~/.claude/projects/<專案>/<session>.jsonl` 每一列的格式是 Claude Code 的內部格式，會隨版本變動',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'The entry format is internal to Claude Code', hash: 'sha256:745e547f87f1cdb7' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/sessions', fetched: '2026-10-02' }),
    },
  ),
]
