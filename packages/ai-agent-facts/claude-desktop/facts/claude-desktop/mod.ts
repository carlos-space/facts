import { factsOf, observedDoc, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-desktop',
  topics: ['mod'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/reference.md', fetched: '2026-10-19' }),
})

export const modFacts = [
  mf.statement(
    'mod-runtime-requirement',
    'mod 預設開啟。終端機要 Claude Code 2.1.287 以上，桌面 app 內建的 Claude Code 要 2.1.286 以上，版本不夠時 mod 不會載入。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Mods are on by default. In the terminal, use Claude Code v2.1.287 or later',
          hash: 'sha256:98bfca228fc082b9',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/overview.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-hook-time-limit',
    'mod hook 處理一個事件最多 10 秒，prompt.edit hook 最多 50 毫秒。等 next 與 mods API 呼叫的時間不計，$.clock.sleep 除外。.catch 處理者最多 1 秒。超過時限的 hook 會被跳過。',
    {
      topics: ['hook'],
      verify: {
        probe: { kind: 'hash', anchor: "A hook's own execution time for one event", hash: 'sha256:dac1d9e86a5d16d6' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
    },
  ),
  mf.statement(
    'mod-worker-crash-unload',
    '已安裝的 mod 共用一個 worker。worker 停止 3 次而查不出是哪個 mod 造成時，這個會話裡全部非內建的 mod 都會卸載，組織安裝的也一樣。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'mods that run in the hooks worker are off for this session',
          hash: 'sha256:b94f97c7740a5254',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({
        url: 'https://code.claude.com/docs/en/plugins/mods/troubleshoot.md',
        fetched: '2026-10-19',
      }),
    },
  ),
  mf.statement(
    'mod-hook-failure-skip',
    '沒有 .catch 的 mod hook 拋錯、逾時或回傳形態不對時，若還沒呼叫 next 就被跳過，由下一個處理者接手，等於這個 mod 不存在。有 .catch 時由它代為回應，但 .catch 處理者本身拋錯或逾時，也當成沒有處理者跳過。',
    {
      topics: ['hook', 'blocking'],
      verify: {
        probe: { kind: 'hash', anchor: "A hook that fails doesn't break the session", hash: 'sha256:8223558b9a1f188b' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/events.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-tool-check-order',
    'mod 的 tool.check 在權限規則與 PreToolUse hook 判定之後執行。不在 plan mode，或呼叫是唯讀時，它的回答取代前面的判定。它能放行 ask 規則與非 managed 的 PreToolUse 阻擋，auto mode 下它放行的呼叫不經分類器。需要使用者互動的工具照樣詢問。',
    {
      topics: ['permission'],
      verify: {
        probe: { kind: 'hash', anchor: 'answers after the rules and the', hash: 'sha256:dce7866d9d9abc03' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/permissions.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-deny-rule-override',
    '有 managed settings 或以 Team、Enterprise 方案登入時，deny 規則預設優先於 mod 的 tool.check，組織可以改這個預設。其他情況下，不在 plan mode 或呼叫是唯讀時，mod 的 tool.check 能放行 deny 規則擋下的呼叫。',
    {
      topics: ['permission'],
      verify: {
        probe: { kind: 'hash', anchor: 'deny rules hold over the mod by default', hash: 'sha256:b0bdf3df0263651a' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/permissions.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-catch-fail-closed',
    '擋下用的 mod hook 加了 .catch 時，原 hook 還沒呼叫 next 就失敗，.catch 回傳那個事件的拒絕，例如 tool.call 的 deny、prompt.submit 的 drop。原 hook 已呼叫 next 才失敗時，.catch 回傳 next(e)，它交回那次呼叫的結果，不會再執行一次。tool.check 與 plugin.register 回傳的拒絕在 next 之後仍然成立，.catch 直接回傳拒絕，不必分兩種情況。',
    {
      topics: ['hook', 'blocking'],
      verify: {
        probe: { kind: 'hash', anchor: 'The same handler shape fits a guard on', hash: 'sha256:5037d503f1630371' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/events.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-tool-call-results',
    'mod 的 tool.call 在工具要執行時觸發。hook 可以交給 next 照常執行、回傳拒絕，或直接回傳結果代替執行。',
    {
      topics: ['hook'],
      verify: {
        probe: { kind: 'hash', anchor: 'A tool is about to run', hash: 'sha256:65d8d0238a10b14f' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
    },
  ),
  mf.statement(
    'mod-prompt-events',
    'mod 的 prompt.submit 在使用者送出提示時觸發，可以改寫提示、附加 context 或擋下提示。prompt.compose 在組系統提示時觸發，回傳依序送出的段落清單。',
    {
      topics: ['hook'],
      verify: {
        probe: { kind: 'hash', anchor: 'Claude Code renders a system prompt', hash: 'sha256:68282dba7f67c6df' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
    },
  ),
  mf.statement(
    'mod-ui-render',
    'mod 的 ui.render 在 Claude Code 要畫介面上的某個 render site 時觸發，回傳要畫的元素樹。render site 是介面的擴充點，終端機、桌面 app 與 VS Code 支援的位置不同。',
    {
      topics: ['desktop'],
      verify: {
        probe: { kind: 'hash', anchor: 'is about to be drawn', hash: 'sha256:704051dcfc05d574' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
    },
  ),
  mf.statement(
    'mod-clock-timer',
    '跨事件的背景工作由 session.start 啟動的計時器執行，$.clock.every 與 $.clock.after 取代 setInterval 與 setTimeout。計時器在模組重新載入時停止。',
    {
      topics: ['session'],
      verify: {
        probe: { kind: 'hash', anchor: 'Work that outlives one event', hash: 'sha256:0764477ee4b18b28' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/api.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-no-node-api',
    'mod 的 hooks 模組沒有 Node.js API，也沒有 setTimeout 這類計時器全域。讀寫檔案、起行程與連網都要經過 mods API。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'The hooks module itself has no Node', hash: 'sha256:fa092ee7cea13de8' },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/api.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-tool-check-classifier-skip',
    'auto mode 下，tool.check 的 next 拿到的是分類器之前的判定。mod 回傳 allow 時權限判定 6 ms 就結束，不跑分類器。不載入 mod 時，同一個指令的判定花 3,948 ms（各 1 輪）。',
    {
      topics: ['permission'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在沒有遠端、也不在 mainflow hub 底下的空 git 倉庫，用 `claude -p --model haiku --permission-mode auto --setting-sources project --debug-file <log>` 跑兩次。一次以 `--plugin-dir` 載入只放行含 spike-mod-allow 指令的 tool.check mod，一次不載入，都請模型執行 `git push --force origin main # spike-mod-allow`。這要呼叫模型，而且要由使用者在自己的終端機跑，因為從 auto mode 的會話啟動會被分類器擋下。成立的條件是載入 mod 那次的 debug log 有 `ask -> allow by plugin`，permissionDecisionMs 是個位數，不載入的那次是秒級',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '本機 headless，桌面 app 內建的 Claude Code 2.1.299',
      source: observedSpike({ fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-types-skill-copy',
    '載入內建的 plugin-authoring skill 時，Claude Code 把這一版的 API 型別檔寫在 `/private/tmp/claude-<uid>/bundled-skills/<版本>/<雜湊>/plugin-authoring/types/claude-code.d.ts`，每個行程一份。用它加一份放在 mod 資料夾外的 tsconfig 就能做型別檢查。型別檔沒有宣告 `console`，測試檔用了它，型別檢查就會失敗。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在會話裡載入 plugin-authoring skill，看它開頭寫的型別檔路徑存在。再用 promptex 匯出一個含 mod 與 `*.test.ts` 的 plugin，寫一份 tsconfig 放在 plugin 外，include 那份型別檔與 mod 目錄，跑 `tsc -p`。成立的條件是正確的 mod 結束碼 0，打錯事件欄位名的 mod 結束碼 1，測試檔用了 `console` 也是 1。載入 skill 要在互動會話做，不能自動重跑',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '本機，桌面 app 內建的 Claude Code 2.1.299 載入 plugin-authoring skill，tsc 7.0.2 對 promptex 匯出的 plugin 正反各 1 次',
      source: observedSpike({ fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-desktop-shown-sites',
    '桌面 app 的 Code 分頁會呼叫 mod 的帶狀區（`AbovePrompt`）、模式標籤（`SessionMode`）、回覆下方（`AssistantMessage`）、`Spinner` 與面板（`Pane`）的 `ui.render`，送出訊息也經過 `prompt.submit`。`$.ui.toast`、`$.ui.ask`、`$.prompt.fill` 在畫面上有反應。render hook 每次重畫都被呼叫一次，所以次數遠多於畫面上出現的次數',
    {
      topics: ['desktop'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在桌面 app 打 `/ui-showcase` 開面板並打開記錄，送一則訊息、按每個「開啟」與「試試看」，讀計數檔與使用者回報的畫面。要在桌面 app 的互動會話做，不能自動重跑',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '本機，桌面 app 內建的 Claude Code 2.1.299，介面示範 mod 計數各位置被呼叫的次數，使用者回報畫面，n=1',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-20' },
    },
  ),
  mf.statement(
    'mod-desktop-hidden-sites',
    '桌面 app 的 Code 分頁從未呼叫提示列（`PromptHint`）與自動完成（`prompt.autocomplete`）。`turn.complete` 有觸發，但回傳改寫的 `text` 不會顯示在回覆下方。`$.prompt.suggest` 回 `isShown: true`，畫面卻沒有出現建議。官方文件寫這幾項在桌面可用或會顯示，所以這是 app 和文件不一致，mod 端改不了',
    {
      topics: ['desktop'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '同 mod-desktop-shown-sites，另在介面示範 mod 加回這幾處的 hook，看計數與畫面。要在桌面 app 的互動會話做，不能自動重跑',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '本機，桌面 app 內建的 Claude Code 2.1.299，介面示範 mod 在使用者送出多則訊息後計數仍是 0，n=1；官方 https://code.claude.com/docs/en/plugins/mods/reference.md 的 Render sites 表',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-20' },
    },
  ),
  mf.statement(
    'mod-desktop-status-line',
    '桌面 app 的 Code 分頁會把 `$.ui.status` 的文字顯示在輸入框下方。每個 plugin 一行，下一次呼叫取代上一次，傳 `undefined` 清掉',
    {
      topics: ['desktop'],
      verify: {
        probe: {
          kind: 'manual',
          reason: '在桌面 app 打 `/ui-showcase` 開面板，按狀態列的「試試看」，請使用者回報輸入框下方有沒有出現文字',
        },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      note: '本機，桌面 app 內建的 Claude Code 2.1.304，介面示範 mod 按狀態列的「試試看」，使用者回報看得到，n=1；每個 plugin 一行與清除方式取自同版 plugin-authoring skill 型別檔的 `$.ui.status` 說明',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-21' },
    },
  ),
  mf.statement(
    'mod-desktop-unconfirmed-calls',
    '桌面 app 裡呼叫 `$.ui.log` 正常回傳，`$.ui.copy` 回 `{ isCopied: true }`，`$.audio.speak` 回 `{ via: "system" }`，但畫面上有沒有出現還沒有人確認',
    {
      topics: ['desktop'],
      verify: {
        probe: {
          kind: 'manual',
          reason: '在桌面 app 打 `/ui-showcase` 開面板，按這三項的「試試看」，請使用者回報畫面上看到什麼',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '本機，桌面 app 內建的 Claude Code 2.1.299，介面示範 mod 記下的回傳值，n=1',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-20' },
    },
  ),
]
