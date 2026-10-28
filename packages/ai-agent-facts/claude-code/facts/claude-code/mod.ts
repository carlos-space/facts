import { factsOf, observedDoc, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['mod'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/loading.md', fetched: '2026-10-19' }),
})

export const modFacts = [
  mf.statement(
    'mod-tool-check-bypass',
    '略過權限模式（`--dangerously-skip-permissions`）下，mod 的 tool.check 仍會被呼叫。唯讀的 `echo` 指令，next 拿到的判定是 allow。mod 回傳 deny 時，呼叫照樣被擋下，列進 result 事件的 permission_denials。',
    {
      topics: ['permission'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '開一個 eval 用途的 sandbox，在客體用 `claude -p --model haiku --setting-sources project --dangerously-skip-permissions --plugin-dir <mod> --debug-file <log> --output-format json` 跑兩次。一次載入只對含標記的 Bash 指令回傳 allow 的 tool.check mod，一次載入只對含標記的指令回傳 deny 的 mod，都請模型執行 `echo` 帶標記的指令。token 用 `sandbox exec --secret-env CLAUDE_CODE_OAUTH_TOKEN` 送進客體。這要呼叫模型。成立的條件是兩次的 debug log 都有 tool.check 的呼叫紀錄且 next 的判定是 allow，回傳 deny 那次的 result 事件 permission_denials 列出帶標記的指令',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      note: '評測 sandbox 內的終端機 Claude Code 2.1.292，macos-lite 模式、eval 用途，headless，放行與擋下各 1 輪',
      source: observedSpike({ fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'plugin-skills-dir-load',
    '`~/.claude/skills/` 或專案 `.claude/skills/` 底下帶 `.claude-plugin/plugin.json` 的資料夾會被當成 plugin 原地載入，id 是 manifest 的 name 加 `@skills-dir`。開不開看 manifest 的 `defaultEnabled`，設定檔可以用 `<name>@skills-dir` 覆寫。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'You saved a plugin directory that has a `.claude-plugin/plugin.json` under',
          hash: 'sha256:082cea98995d775d',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
    },
  ),
  mf.statement(
    'plugin-default-enabled',
    'manifest 沒設 `defaultEnabled` 時預設是 `true`，使用者還沒在 `enabledPlugins` 設定這個 plugin 時，它一開始就是開的',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: "Whether the plugin starts enabled when the user hasn't set it in",
          hash: 'sha256:cbd1f5b233171248',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins-reference.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'plugin-project-skills-dir-trust',
    '專案 `.claude/skills/` 底下的 plugin 要先接受那個資料夾的工作區信任才會載入，信任上層資料夾或用 `-p` 執行都不夠。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: "Trusting a parent folder or running with `-p` isn't enough",
          hash: 'sha256:8814242396dfcf32',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
    },
  ),
  mf.statement(
    'mod-types-written-on-load',
    'Claude Code 只在互動會話用 `--plugin-dir` 載入 mod，或載入 Claude 代寫的 mod 時，把這一版的型別檔與 tsconfig 寫進 mod 的 `.claude-plugin/types/`。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: "it writes TypeScript declaration files into the mod's `.claude-plugin/types/` directory",
          hash: 'sha256:e537a8b56a71aeac',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/create.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'plugin-validate-strict',
    '`claude plugin validate <目錄>` 讀 plugin 的 manifest 與 hooks module，回報錯誤、處理的事件與呼叫的 mods API。`--strict` 把警告當成錯誤，例如 manifest 缺 author、skill 缺 description。',
    {
      verify: {
        probe: { kind: 'hash', anchor: '`--strict` treats warnings as errors', hash: 'sha256:289fe568991a9af1' },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/reference.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'plugin-test-command',
    '`claude plugin test <目錄>` 跑目錄底下所有檔名結尾是 `.test.ts` 或 `.test.tsx` 的測試，測試從 `claude-code/testing` 取測試工具，不需要會話、登入或網路。每個測試檔至少要有一個 `test()`，有測試失敗時結束碼是 1。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Every test file needs at least one `test()`', hash: 'sha256:18a24f6155f0dd32' },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/plugins/mods/test.md', fetched: '2026-10-19' }),
    },
  ),
  mf.statement(
    'mod-terminal-only-sites',
    '`ui.render` 的 `TurnDuration` 與 `InfoNotice` 只在終端機觸發，桌面 app 不呼叫',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason: '在新版載入 plugin-authoring skill，讀型別檔 `RenderComponent` 各元件的 Raised on 說明',
        },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      note: 'Claude Code 內建 plugin-authoring skill 的型別檔 `claude-code.d.ts`（2.1.304）中這兩個元件的 Raised on 說明',
      source: { kind: 'observed', basis: 'doc', fetched: '2026-10-21' },
    },
  ),
  mf.statement(
    'mod-element-limits',
    '`Button` 的子元素只能是字串與 `Text`，放其他元素時整棵樹會被引擎拒絕。`Input` 寫 `rows` 2 以上時是多行輸入框。mobile 介面沒有 `Input` 與 `Select`。終端機沒有 `Svg`，桌面、VS Code 與 mobile 有，動畫要寫在 SVG 裡',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '寫一個 Button 帶 Text 子元素的 mod 測試，用 `$.ui.mount` 掛在 desktop，跑 `claude plugin test`，看引擎是否拒絕。再讀新版型別檔的 `ButtonProps`、`InputProps` 與 `Elements`',
        },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      note: 'Input 的 rows、mobile 沒有的元素與終端機沒有 Svg 取自文件，出處是 plugin-authoring skill 2.1.304 的型別檔 `ButtonProps`、`InputProps` 與 `Elements`，以及更新紀錄 2.1.295 與 2.1.301 的條目。Button 的子元素是實測：本機，桌面 app 內建的 Claude Code 2.1.304 的 `claude plugin test` 掛載 Button 帶 Text 子元素的 mod 通過',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-21' },
    },
  ),
  mf.statement(
    'mod-space-scale',
    '間距（`gap`、`padding`）寫數字時單位是字元格，桌面 app 上幾乎沒有留白。2.1.299 起可以寫 `xs`、`sm`、`md`、`lg`、`xl` 級距，由各介面換成自己的尺度。較舊的版本會拒絕級距、`weight` 與 `tabular`',
    {
      topics: ['desktop'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '對一個用 `gap="md"` 的 mod 用新版 claude 跑 `claude plugin test`，看是否通過，再讀型別檔 `Space` 的說明',
        },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      note: '本機，終端機的 Claude Code 2.1.292 與桌面 app 內建的 2.1.299 對同一個 mod 跑 `claude plugin test`，2.1.292 拒絕 `gap="md"`、2.1.299 通過；型別檔 `Space` 的說明',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-21' },
    },
  ),
  mf.statement(
    'mod-reload-at-turn-end',
    '從資料夾載入的 mod，在會話自己這一輪裡改的檔，等這一輪結束才重新載入一次；這個 mod 註冊的工具或指令要執行時會提早重載。重新載入會重跑 `register` 與 `session.start`，模組變數從頭來，計時器被取消，`$.state` 與 `$.store` 保留',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在新版載入 plugin-authoring skill，讀 reference.md 的「Developing one」節與 SKILL.md 的「WHAT HAPPENS WHEN THE TURN ENDS」節，核對重新載入的時機與保留的狀態',
        },
        verifiedOn: '2.1.304',
        screenedThrough: '2.1.304',
      },
      note: 'Claude Code 內建 plugin-authoring skill 的 SKILL.md 與 reference.md（2.1.304）的「Developing one」節',
      source: { kind: 'observed', basis: 'doc', fetched: '2026-10-21' },
    },
  ),
  mf.statement(
    'mod-tool-call-args',
    '`tool.call` 事件裡，工具的參數放在事件頂層，和 `tool` 並列，例如 AskUserQuestion 是 `e.questions`。`tool.check` 的參數才在 `e.input`。對要人回答的工具（AskUserQuestion、計畫確認）在 `tool.check` 回 allow 不會關掉對話框，要在 `tool.call` 直接回 `{ result }`',
    {
      topics: ['pretooluse'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在新版載入 plugin-authoring skill，讀型別檔的 `ToolCallInput`、`ToolCallReserved`、`ToolCheckInput` 與 `tool.check` 的說明',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: 'Claude Code 內建 plugin-authoring skill 的型別檔 `claude-code.d.ts`（2.1.299）的 `ToolCallInput`、`ToolCheckInput` 與 `tool.check` 說明',
      source: { kind: 'observed', basis: 'doc', fetched: '2026-10-20' },
    },
  ),
]
