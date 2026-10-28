import { factsOf, observedDoc, observedSpike } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['headless'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/headless.md', fetched: '2026-10-21' }),
})

export const headlessFacts = [
  mf.statement(
    'stream-json-hook-response-event',
    '--output-format stream-json 時，SessionStart 或 Setup hook 執行期間會即時發出 hook_started、hook_progress、hook_response 三種事件（system 訊息的子型別），跑在 system/init 事件之前。',
    {
      topics: ['stream-json', 'hook'],
      verify: {
        probe: { kind: 'hash', anchor: 'These stream as the hook produces them', hash: 'sha256:e3fa7d2185c1b3b2' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.292',
      },
    },
  ),
  mf.statement(
    'stream-json-permission-denials',
    '搭配 --permission-prompts none 時，被拒絕的呼叫在 stream-json 以 permission_denied 系統訊息即時出現，並在最終的 result 事件的 permission_denials 欄位彙總列出。',
    {
      topics: ['stream-json', 'permission'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'system messages, and the final result message lists them',
          hash: 'sha256:e253dffd2beaafbe',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.292',
      },
    },
  ),
  mf.statement(
    'stream-json-tool-use-location',
    'stream-json 輸出裡，tool_use 是 assistant 事件 `message.content` 陣列中的一種區塊。',
    {
      topics: ['stream-json'],
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在一個獨立的 git 倉庫放一個只要求回固定字的 skill，headless 跑 `claude -p "Use the probe-skill skill." --output-format stream-json --verbose --max-turns 6`，約 0.4 美元。成立的條件是 tool_use 區塊出現在 assistant 事件的 message.content 陣列裡',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.292',
      },
      note: '本機 headless，Claude Code 2.1.285',
      source: observedSpike({ fetched: '2026-10-02' }),
    },
  ),
]
