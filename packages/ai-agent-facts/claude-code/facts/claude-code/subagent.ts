import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['subagent'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/sub-agents.md', fetched: '2026-10-02' }),
})

export const subagentFacts = [
  mf.statement(
    'agent-tool-restriction',
    'agent 的 tools 是允許清單，disallowedTools 是拒絕清單；兩者都設時先套用 disallowedTools，再用 tools 從剩下的池子裡篩選。',
    {
      topics: ['tool-restriction'],
      verify: {
        probe: { kind: 'hash', anchor: 'is applied first, then', hash: 'sha256:c8f6eb1d54ac22cc' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'subagent-isolated-context',
    '每個子代理從全新、獨立的 context window 開始，看不到主對話的歷史。fork 出來的子代理例外，會繼承父對話。',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Each subagent starts with a fresh, isolated context window',
          hash: 'sha256:fae6b63877893e4f',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement('subagent-no-ask-user', '子代理的可用工具一律移除 `AskUserQuestion`，即使列在 tools 裡也一樣。', {
    topics: ['tool-restriction'],
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'The first filter removes these tools, even when listed in the',
        hash: 'sha256:a1b1a5ab35aaf0e5',
      },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
  }),
  mf.statement(
    'subagent-loads-claude-md',
    '除了內建的 Explore 與 Plan，每個子代理啟動時都載入 CLAUDE.md 與 git status 快照。定義設了 `omitClaudeMd: true` 時，啟動時略過 user、project、local 三層 CLAUDE.md，managed 政策檔仍載入（managed 子代理除外）；CLAUDE.md 與專案記憶仍會經一般的訊息流程載入，例如處理子目錄的檔案時那裡的 CLAUDE.md。',
    {
      topics: ['memory'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Explore and Plan start without your CLAUDE.md files',
          hash: 'sha256:3abefdb871336b07',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/sub-agents.md', fetched: '2026-10-20' }),
    },
  ),
  mf.statement(
    'subagent-skills-preload',
    'agent 定義的 `skills` 欄位列出啟動時預載進子代理 context 的 skill，注入的是 skill 全文。',
    {
      topics: ['skill'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: "to preload into the subagent's context at startup",
          hash: 'sha256:1a326fad87dcebd4',
        },
        verifiedOn: '2.1.292',
        screenedThrough: '2.1.292',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/sub-agents.md', fetched: '2026-10-20' }),
    },
  ),
  mf.statement('agent-call-model', '呼叫 Agent 工具時可以帶 `model` 參數，只覆寫這一次委派用的模型。', {
    verify: {
      probe: { kind: 'hash', anchor: 'can also pass a', hash: 'sha256:2752b121a9b0ac65' },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
  }),
  mf.statement(
    'agent-frontmatter-effort',
    'effort 是子代理定義 frontmatter 的欄位，子代理執行時會覆寫 session 的 effort 層級。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Effort level when this subagent is active', hash: 'sha256:c03f2612fc728bbb' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'builtin-subagents',
    '內建的 Explore、Plan、general-purpose 子代理用預先定義的提示詞，使用者或專案層的同名定義會蓋過內建的。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Built-in agents have predefined prompts', hash: 'sha256:f4e8a38a21a2cb82' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'delegation-layer-cost',
    '同一個搜尋任務每多一層子代理，就多一份固定成本，只負責轉交的那一層也一樣。較新的 2.1.285 量到每層約 4.8 萬 token 與 5 秒，轉交層做 1 次工具呼叫。較早的一次量到每層約 15.3 萬 token 與 40 秒，轉交層做 2 次工具呼叫，量測紀錄沒記版本與執行方式。兩次的數字差 3 到 8 倍，差距的原因沒查。三層在 2.1.285 沒有量到。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '用 general-purpose 代理、model 設 sonnet，跑同一個小型搜尋任務，分一層、兩層、三層委派，中間層只轉交，每組跑三次取中位數。各層的 subagent_tokens 分開計，不含下一層，並記下每層的 tool_uses。成立的條件是每多一層，subagent_tokens 約多一份固定成本，本機 2.1.285 約 4.8 萬 token 與 5 秒。任務工作量大時，增量占比會小於這個值。2.1.285 的三層沒有出現，只有一層與兩層的資料',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機。較早一次沒記版本，同日的 spike 用 Claude Code 2.1.283。較新一次是 headless，Claude Code 2.1.285',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-02' },
    },
  ),
  mf.statement(
    'omit-claude-md-savings',
    '同一個任務，設 `omitClaudeMd` 的子代理看不到 CLAUDE.md 的標題，用的 token 比不設的少。2.1.283 量到 14218 對 95754，少約 85%，兩組的工具呼叫是 2 次對 1 次。2.1.285 量到三次中位數 23618 對 33926，少約 30%，兩組都是 1 次。兩次的差距原因沒查。',
    {
      topics: ['memory'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            'headless 用 --agents 定義兩個只差 omitClaudeMd 的代理，prompt 用 stdin 餵（放在 --allowedTools 後面會被當成工具名），跑同一個搜尋任務並問它看不看得到 CLAUDE.md 的標題，每組跑三次，約 1 美元。成立的條件是結果相同、設了的那個看不到標題，而且 subagent_tokens 比不設的少。少多少隨 CLAUDE.md 的大小與工具呼叫次數變動，要記下兩組的 tool_uses',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless，Claude Code 2.1.283（2026-09-28）與 2.1.285（2026-10-02）兩次量測',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-02' },
    },
  ),
  mf.statement(
    'background-subagent-stall',
    '背景子代理連續 10 分鐘沒有串流進度就會被中止，預設值 600000 毫秒，可用環境變數 `CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS` 調整。',
    {
      topics: ['timeout'],
      verify: {
        probe: { kind: 'hash', anchor: 'CLAUDE_ASYNC_AGENT_STALL_TIMEOUT_MS', hash: 'sha256:51deb28276afd350' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/env-vars', fetched: '2026-10-03' }),
    },
  ),
]
