import { factsOf, observedDoc, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['hook'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/hooks.md', fetched: '2026-10-02' }),
})

export const hookFacts = [
  mf.statement(
    'hook-blocking-events',
    '現行可阻擋的 hook 事件有 16 個：PreToolUse、UserPromptSubmit、UserPromptExpansion、Stop、SubagentStop、TeammateIdle、TaskCreated、TaskCompleted、ConfigChange、PostToolBatch、PreCompact、PreModelSwitch、Elicitation、ElicitationResult、WorktreeCreate、WorktreeRemove。PostToolUse 等事後類事件在動作已執行後才觸發，不能阻擋。matcher 對工具事件用正則，或以管道符號、逗號分隔的工具名比對。',
    {
      topics: ['blocking'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Stops the agentic loop before the next model call',
          hash: 'sha256:f72337075d9eb585',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'hook-stdout-context',
    'exit 0 時的純文字 stdout 多數只寫進除錯紀錄，模型看不到；例外是 UserPromptSubmit、UserPromptExpansion、SessionStart、PostModelSwitch 四個事件，這幾個事件的純文字 stdout 會加進模型可見的 context。PostToolUse 要讓模型看到內容，須輸出 JSON 的 hookSpecificOutput.additionalContext；以退出碼 2 結束時 stderr 會顯示給模型，但仍不能阻擋，因為工具已執行完畢。',
    {
      topics: ['stdout'],
      verify: {
        probe: { kind: 'hash', anchor: 'adds plain-text stdout as context', hash: 'sha256:ac134e5adef03537' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/hooks.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'precompact-stdout-summary',
    'PreCompact hook 以結束碼 0 結束時，非空的 stdout 會附加進摘要指示，寫摘要的模型看得到。多個 PreCompact hook 的輸出都會進摘要，官方文件沒寫順序，一輪試跑看到的順序和宣告順序相反。',
    {
      topics: ['stdout'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在臨時目錄的 .claude/settings.json 掛兩個 PreCompact hook，各印一個標記字串並要求摘要寫出它，用 claude -p 跑一輪再 --resume 送 /compact。成立的條件是對話紀錄裡 isCompactSummary 那一列同時含兩個標記，並記下它們的先後',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless，Claude Code 2.1.285，一輪試跑，兩個 hook 各印一個標記，另讀 Claude Code 程式包的壓縮流程確認 stdout 併入摘要指示',
      source: observedSpike({ fetched: '2026-10-03' }),
    },
  ),
  mf.statement(
    'pre-write-check-mechanisms',
    '寫入前能檢查內容的機制只有 PreToolUse hook 與 permission deny 兩種，沒有獨立的寫入前 linter。',
    {
      topics: ['permission'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '跨 hooks、permissions、plugins 三份文件比對得出的推論（無獨立 linter 機制），沒有單一頁面的錨點可自動比對',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: 'https://code.claude.com/docs/en/hooks-guide.md、https://code.claude.com/docs/en/permissions.md、https://code.claude.com/docs/en/plugins.md',
      source: observedDoc({ url: 'https://code.claude.com/docs/en/hooks-guide.md', fetched: '2026-10-02' }),
    },
  ),
  mf.statement(
    'pretooluse-hook-behavior',
    'PreToolUse hook 在工具呼叫前、matcher 命中時觸發，可以讀 tool_input 判斷。回傳 hookSpecificOutput.permissionDecision 為 deny 會阻擋該次呼叫；退出碼 2 一律阻擋，且蓋過 JSON 的 allow，阻擋原因取 JSON 的 reason，沒有就取 stderr。',
    {
      topics: ['pretooluse'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Exit 2 blocks even when your hook prints JSON',
          hash: 'sha256:d9b18c12e69f31b3',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/hooks.md', fetched: '2026-10-18' }),
    },
  ),
  mf.statement(
    'posttooluse-hook-behavior',
    'PostToolUse hook 在工具呼叫成功後觸發，此時工具已執行完畢，不能阻擋。要讓模型看到內容須輸出 JSON 的 hookSpecificOutput.additionalContext；以退出碼 2 結束時 stderr 會顯示給模型，但仍不能阻擋。',
    {
      topics: ['posttooluse'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Shows stderr to Claude; the tool already ran',
          hash: 'sha256:ac85f3c85f79bddd',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'stop-hook-behavior',
    'Stop hook 在回合結束時觸發。退出碼 2 或 JSON 的 decision 為 block 會阻止結束、讓對話繼續；stop_hook_active 欄位標示這次續行是否已由 Stop hook 促成。Stop hook 連續讓回合續行 8 次後，平台會覆寫下一次阻擋並結束回合；模型每次呼叫工具時連續次數歸零，上限可用 CLAUDE_CODE_STOP_HOOK_BLOCK_CAP 調整。JSON 的 hookSpecificOutput.additionalContext 也會讓對話繼續，紀錄標成 Stop hook feedback，不顯示 hook 錯誤通知。',
    {
      topics: ['stop'],
      verify: {
        probe: { kind: 'hash', anchor: '8-consecutive-continuation cap', hash: 'sha256:d5f415db50e94a8e' },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/hooks.md', fetched: '2026-10-21' }),
    },
  ),
  mf.statement(
    'messagedisplay-hook-behavior',
    'MessageDisplay hook 在助理訊息串流顯示的過程中分批觸發，每批新完成的幾行觸發一次，回傳 hookSpecificOutput.displayContent 會取代畫面上的那幾行，對話紀錄與模型讀到的仍是原文。它不支援 matcher，沒有決策控制，中性事件詞彙沒有它，要以 promptex:event 指名。非互動執行與 Agent SDK 每則訊息只觸發一次，輸入沒有 stop_reason，message_id 也對不到對話紀錄，所以分不出哪一則是回合的最後一則。',
    {
      topics: ['messagedisplay'],
      verify: {
        probe: { kind: 'hash', anchor: 'Runs while an assistant message streams', hash: 'sha256:de059c0d79189c64' },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/hooks.md', fetched: '2026-10-21' }),
    },
  ),
  mf.statement(
    'hook-event-cadence',
    'hook 事件依觸發頻率分三類：每個 session 一次（SessionStart、SessionEnd）、每個回合一次（UserPromptSubmit、Stop、StopFailure）、每次工具呼叫一次（PreToolUse、PostToolUse）。',
    {
      topics: ['cadence'],
      verify: {
        probe: { kind: 'hash', anchor: 'Events fall into three cadences', hash: 'sha256:674f3ea1ae070324' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement('hook-matcher-omitted', 'hook 的 matcher 省略或寫 `*` 時比對全部，事件每次發生都觸發。', {
    topics: ['filter'],
    verify: {
      probe: { kind: 'hash', anchor: 'If you omit the matcher or use', hash: 'sha256:02bb049dffd7760b' },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
  }),
  mf.statement(
    'stop-block-second-reply',
    'Stop hook 以 decision block 擋下時，已送出的回覆不會收回。reason 以 Stop hook feedback 送回模型，模型在後面再回一則，兩則都留在對話裡。',
    {
      topics: ['stop'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在一個獨立的 git 倉庫放一個只要求回固定字的 skill，headless 跑 `claude -p "Use the probe-skill skill." --output-format stream-json --verbose --max-turns 6`，約 0.4 美元，另掛一個 Stop hook，在 stop_hook_active 為 false 時回 decision block。成立的條件是第一則回覆之後出現 Stop hook feedback，模型再回一則，兩則都留在輸出裡',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.304',
      },
      note: '本機 headless，Claude Code 2.1.285',
      source: observedSpike({ fetched: '2026-10-21' }),
    },
  ),
  mf.statement(
    'hook-env-session-trace',
    'hook 程序的環境有 `CLAUDE_CODE_SESSION_ID`。開著 detailed beta tracing 時也有 `TRACEPARENT`，指向 hook span 的父節點',
    {
      topics: ['environment', 'telemetry'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '開啟 OTel 與 detailed tracing，用一支印出環境變數的 hook 跑一輪 claude -p，主會話與子代理各觸發一次。成立的條件是兩處都有 CLAUDE_CODE_SESSION_ID 與 TRACEPARENT，而且 TRACEPARENT 的 span id 是匯出資料裡 hook span 的父 span',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless（`-p`），Claude Code 2.1.285，開著 detailed beta tracing，探針 hook 印出自己的環境變數，主會話與子代理共三輪',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-05' },
    },
  ),
  mf.statement(
    'hook-env-traceparent-without-detailed',
    '沒開 detailed beta tracing 時，主會話裡 matcher 為 Bash 的 PreToolUse hook 也有 `TRACEPARENT`。同一輪的 4 次呼叫值相同。同一場的 SessionStart hook 沒有 `TRACEPARENT`。它指向哪個 span 還沒量過。其他工具的 PreToolUse、其他 hook 事件與子代理的 hook 有沒有，也還沒量過。實測只設了 `CLAUDE_CODE_ENABLE_TELEMETRY=1`、`CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1` 與 `OTEL_TRACES_EXPORTER=otlp`。detailed 的兩個變數沒寫在指令裡。當天事後用 rg 查 `env` 與 `~/.claude/settings.json`，也沒有命中。開著 detailed 時 traces 會改送 `BETA_TRACING_ENDPOINT`，這次接收端在一般的 `/v1/traces` 收到 traces',
    {
      topics: ['environment', 'telemetry'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '照 source 的環境變數，用 env -u ENABLE_BETA_TRACING_DETAILED -u BETA_TRACING_ENDPOINT 前綴，並確認 settings 的 env 沒有這兩個。掛一支 SessionStart hook 與一支 matcher 為 Bash 的 PreToolUse hook，把 TRACEPARENT 附加寫進同一個檔，跑一場會呼叫 Bash 的 claude -p。成立的條件是 SessionStart 那行沒有值，PreToolUse 每行都有且彼此相同',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless（`-p`），Claude Code 2.1.285，一場主會話，n=1',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-08' },
    },
  ),
  mf.statement(
    'hook-command-shell',
    'command 型 hook 沒有 `args` 時，指令字串交給 shell 執行，macOS 與 Linux 是 `sh -c`。shell 會切字、展開變數，也會解讀管線、`&&`、重導向與萬用字元。',
    {
      topics: ['environment'],
      verify: {
        probe: { kind: 'hash', anchor: 'The command string is passed to a shell', hash: 'sha256:e2a128ec11ec6282' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/hooks', fetched: '2026-10-06' }),
    },
  ),
  mf.statement(
    'cloud-skips-user-hooks',
    '雲端會話不套用使用者層 `~/.claude/settings.json` 的 hook，因為使用者層的設定只留在本機。',
    {
      topics: ['session'],
      verify: {
        probe: { kind: 'hash', anchor: 'User-level settings stay on your machine', hash: 'sha256:fab6db61bb2d11f5' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/cloud-environments', fetched: '2026-10-05' }),
    },
  ),
  mf.statement('edit-missing-file-skips-pretooluse', 'Edit 對本機不存在的檔會在任何 hook 執行前就回錯', {
    topics: ['pretooluse'],
    verify: {
      probe: {
        kind: 'manual',
        reason:
          '掛一支 PreToolUse hook（matcher 含 Edit）會寫出標記檔，用 claude -p 對一個不存在的路徑做 Edit。成立的條件是 Edit 回檔案不存在的錯，而標記檔沒有出現',
      },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
    note: '本機 Claude Code 2.1.285，n=1',
    source: { kind: 'observed', basis: 'measured', fetched: '2026-10-12' },
  }),
]
