import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-desktop',
  topics: ['session'],
  source: { kind: 'observed', basis: 'measured', fetched: '2026-10-17' },
})

export const sessionFacts = [
  mf.statement(
    'desktop-session-report',
    '桌面 app 用 start_session 開的本機會話停下時，開它的會話會收到附報告開頭的通知，不必輪詢。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在桌面 app 用 start_session 開一場本機會話做一件小事。成立的條件是它停下後，開它的會話收到含報告開頭的通知',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '桌面 app 2.1.299，規劃會話開出的五場本機成員會話停下時都送回通知，n=5',
    },
  ),
  mf.statement(
    'desktop-cloud-session-no-report',
    '桌面 app 用 start_session 在雲端開的會話，停下時不送通知給開它的會話，也不能傳訊回來。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在桌面 app 讀 start_session 的工具說明。成立的條件是說明寫著 target 可選 cloud，且雲端會話不送停下通知、不能傳訊回開它的會話',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '桌面 app 2.1.299 的 start_session 工具說明與會話啟動指示',
      source: { kind: 'observed', basis: 'doc', fetched: '2026-10-17' },
    },
  ),
  mf.statement(
    'desktop-session-start-user-turn',
    '桌面 app 只在使用者本人訊息觸發的那一輪讓 start_session 直接開會話。由其他會話的訊息或自動事件觸發的那一輪，只能建提案卡，等使用者點開。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '讓另一場會話傳訊喚醒規劃會話，請它用 start_session 開會話。成立的條件是那一輪只建出提案卡，使用者本人送訊息的那一輪才直接開成',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '桌面 app 2.1.299，規劃會話由成員會話的訊息喚醒時開不了會話，等使用者本人回覆那一輪才開成，n=1。同版本的會話啟動指示也寫明，由其他會話的訊息或自動事件觸發的那一輪，app 拒絕直接開會話',
    },
  ),
  mf.statement(
    'desktop-session-opener-id',
    '桌面 app 用 start_session 開的本機會話，啟動指示寫著開它的會話的 `local_` 開頭 id，並說明要回報時用 SendMessage 寄給這個 id。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在桌面 app 用 start_session 開一場會話，請它讀出啟動指示裡開它的會話 id 並用 SendMessage 回報。成立的條件是 id 以 local_ 開頭，且回報送達開它的會話',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '桌面 app 2.1.299，由規劃會話用 start_session 開出的成員會話，啟動指示寫著規劃會話的 local_ 開頭 id，用它傳訊回報有送達，n=1',
    },
  ),
  mf.statement(
    'desktop-session-address-local-id',
    '桌面 app 的會話之間用 SendMessage 傳訊時，收件者要寫 `local_` 開頭的桌面會話 id。寫 mainflow 的會話名稱找不到人。',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '在桌面 app 的成員會話分別用 mainflow 會話名稱與 local_ 開頭的 id 傳訊給開它的會話。成立的條件是前者找不到收件者，後者送達',
        },
        verifiedOn: '2.1.299',
        screenedThrough: '2.1.299',
      },
      note: '桌面 app 2.1.299，成員會話用工作說明寫的 mainflow 會話名稱傳訊回報時找不到收件者，n=1。另一場會話用 local_ 開頭的 id 傳訊給兩場會話都送達，n=3',
    },
  ),
]
