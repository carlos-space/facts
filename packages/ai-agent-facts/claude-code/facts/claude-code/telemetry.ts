import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['telemetry'],
  source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-07' }),
})

export const telemetryFacts = [
  mf.statement(
    'otel-env-not-passed-to-subprocesses',
    'Claude Code 不把 `OTEL_*` 環境變數傳給它開的子程序，包括 Bash 工具、hook、MCP server 與 language server。',
    {
      topics: ['environment', 'hook'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'environment variables to the subprocesses it spawns, including the Bash tool, hooks',
          hash: 'sha256:f6bf536ecf2d8d43',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-05' }),
    },
  ),
  mf.statement(
    'otel-headers-helper-refresh',
    '`otelHeadersHelper` 指定的腳本在啟動時執行，之後預設每 29 分鐘再執行一次，用來換新 token。',
    {
      topics: ['authentication'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'The headers helper script runs at startup and periodically thereafter',
          hash: 'sha256:388082d7714abba0',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-05' }),
    },
  ),
  mf.statement('otel-user-email-always', 'OTel 匯出只要取得到 `user.email` 就一律帶上，用戶端沒有開關能拿掉它。', {
    topics: ['security'],
    verify: {
      probe: { kind: 'hash', anchor: 'User email address, from your sign-in', hash: 'sha256:73eda686f91c94a3' },
      verifiedOn: '2.1.285',
      screenedThrough: '2.1.285',
    },
    source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-05' }),
  }),
  mf.value(
    'otel-content-switches',
    [
      {
        name: 'OTEL_LOG_USER_PROMPTS',
        default: 'disabled',
        enableWith: '1',
        whenEnabled:
          '送出使用者提示詞全文。關閉時 user_prompt 事件的提示詞值是 <REDACTED>。tracing 開著時，也讓 span 帶 new_context、system_reminders、system_prompt_preview、user_system_prompt 與 response.model_output 等內容屬性。',
      },
      {
        name: 'OTEL_LOG_ASSISTANT_RESPONSES',
        default: 'disabled',
        enableWith: '1',
        disableWith: '0',
        whenEnabled:
          '在 assistant_response 事件送出模型回覆文字。沒設定時沿用 OTEL_LOG_USER_PROMPTS 的值，設 0 則保持遮蔽。',
      },
      {
        name: 'OTEL_LOG_TOOL_DETAILS',
        default: 'disabled',
        enableWith: '1',
        whenEnabled:
          '在工具事件與 trace span 屬性送出工具參數與輸入，包括 Bash 指令、MCP server 與工具名、skill 名、使用者自訂的 workflow 名與 hook 定義。user_prompt 事件會帶自訂、plugin 與 MCP 指令名，成本與 token 計數器會帶實際的 agent、skill、plugin 與 MCP 名稱。',
      },
      {
        name: 'OTEL_LOG_TOOL_CONTENT',
        default: 'disabled',
        enableWith: '1',
        requires: 'tracing',
        whenEnabled:
          '在 tool.output span 事件送出工具輸出內容，超過內容上限（預設 60 KB）會截斷。Edit 與 Write 另須同時開 OTEL_LOG_TOOL_DETAILS 才會記錄。',
      },
      {
        name: 'OTEL_LOG_RAW_API_BODIES',
        default: 'disabled',
        enableWith: '1',
        alsoAccepts: 'file:<dir>',
        whenEnabled:
          '以 api_request_body 與 api_response_body 事件送出完整的 Anthropic Messages API 請求與回應 JSON，內含整段對話歷史。設 1 時內嵌並在內容上限（預設 60 KB）截斷，設 file:<dir> 時寫成磁碟檔、事件帶 body_ref。開啟等同同意 OTEL_LOG_USER_PROMPTS、OTEL_LOG_TOOL_DETAILS 與 OTEL_LOG_TOOL_CONTENT 會洩漏的一切。',
      },
    ],
    {
      topics: ['security'],
      description: '五個決定 OTel 匯出是否帶內容的環境變數，預設值與開啟後多送什麼。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Bodies include the entire conversation history',
          hash: 'sha256:a4168fa393ec5290',
        },
        verifiedOn: '2.1.308',
        screenedThrough: '2.1.308',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-24' }),
    },
  ),
  mf.value(
    'otel-metrics-attribute-switches',
    [
      {
        name: 'OTEL_METRICS_INCLUDE_SESSION_ID',
        default: 'true',
        disableWith: 'false',
        controls: ['session.id', 'ccr.session.id'],
        note: 'ccr.session.id 只出現在雲端 session。',
      },
      { name: 'OTEL_METRICS_INCLUDE_VERSION', default: 'false', enableWith: 'true', controls: ['app.version'] },
      {
        name: 'OTEL_METRICS_INCLUDE_ACCOUNT_UUID',
        default: 'true',
        disableWith: 'false',
        controls: ['user.account_uuid', 'user.account_id'],
      },
    ],
    {
      description: '三個決定 metrics 帶不帶某些屬性的環境變數，預設值與控制的屬性。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Include user.account_uuid and user.account_id attributes in metrics',
          hash: 'sha256:26b09fa782b12aeb',
        },
        verifiedOn: '2.1.308',
        screenedThrough: '2.1.308',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-24' }),
    },
  ),
  mf.statement(
    'otel-metrics-exporter',
    '`OTEL_METRICS_EXPORTER` 指定 metrics 的匯出器，可填 `console`、`otlp`、`prometheus`、`none`，以逗號分隔可同時用多個，填 `none` 關閉 metrics 匯出。',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Metrics exporter types, comma-separated', hash: 'sha256:12efc306cf2a2c1d' },
        verifiedOn: '2.1.308',
        screenedThrough: '2.1.308',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-24' }),
    },
  ),
  mf.statement(
    'detailed-tracing-enable-vars',
    '要開 detailed beta tracing，得同時設 `ENABLE_BETA_TRACING_DETAILED=1` 與 `BETA_TRACING_ENDPOINT`',
    {
      topics: ['environment'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'which requires ENABLE_BETA_TRACING_DETAILED=1 and BETA_TRACING_ENDPOINT',
          hash: 'sha256:698ed2975466d4a3',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      source: observedDoc({ url: 'https://code.claude.com/docs/en/monitoring-usage', fetched: '2026-10-08' }),
    },
  ),
  mf.statement(
    'traceparent-bash-subprocess',
    'tracing 啟用時，Bash 與 PowerShell 子程序會繼承 `TRACEPARENT`，內容是當下工具執行 span 的 W3C trace context',
    {
      topics: ['environment'],
      verify: {
        probe: { kind: 'hash', anchor: 'subprocesses automatically inherit a', hash: 'sha256:8ff988b468116eaa' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'tracing-enable-conditions',
    '要啟用 tracing，得同時設 `CLAUDE_CODE_ENABLE_TELEMETRY=1` 與 `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`，再用 `OTEL_TRACES_EXPORTER` 指定 span 送到哪裡',
    {
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'then set OTEL_TRACES_EXPORTER to choose where spans are sent',
          hash: 'sha256:c23a224cd48240c0',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'otel-export-interval',
    '`OTEL_LOGS_EXPORT_INTERVAL` 與 `OTEL_TRACES_EXPORT_INTERVAL` 設定 logs 與 spans 的匯出間隔，單位毫秒，預設都是 5000',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Logs export interval in milliseconds', hash: 'sha256:37b080f400b8b795' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'detailed-tracing-reroutes-export',
    '開著 detailed beta tracing 時，logs 與 traces 改送 `BETA_TRACING_ENDPOINT`，不經一般的 logs 與 traces 匯出器',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'exports logs and traces to', hash: 'sha256:58a2003a7dd4a22e' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'detailed-tracing-hook-span',
    '`claude_code.hook` span 只有開著 detailed beta tracing 時才有，只開 enhanced telemetry 不會產生',
    {
      topics: ['hook'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'This span appears only when detailed beta tracing is active',
          hash: 'sha256:e88af54527be22c9',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'detailed-tracing-query-source',
    '`llm_request` span 的 `query_source`（例如子代理名稱）要開 detailed beta tracing 才有。不開時只有收斂過的 `query_source_safe`，值像 `agent.builtin.general-purpose`',
    {
      verify: {
        probe: { kind: 'hash', anchor: 'Subsystem that issued the request', hash: 'sha256:5843c6a24a25e90b' },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'detailed-tracing-content-fields',
    '`tool_input`、`system_prompt_preview`、`response.model_output` 這類帶內容的 span 欄位，只有開著 detailed beta tracing 時才送',
    {
      topics: ['security'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'are emitted only when detailed beta tracing is active',
          hash: 'sha256:9a0f490cec4a6d79',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
    },
  ),
  mf.statement(
    'otlp-compression-batch-size',
    '開著 detailed beta tracing 時，`OTEL_EXPORTER_OTLP_COMPRESSION=gzip` 會讓 traces 的請求壓縮。logs 的請求在同時設 `OTEL_EXPORTER_OTLP_LOGS_COMPRESSION=gzip` 時會壓縮，只設通用變數時還沒量過。兩個變數都不設時都不壓縮。`OTEL_BLRP_MAX_EXPORT_BATCH_SIZE` 與 `OTEL_BSP_MAX_EXPORT_BATCH_SIZE` 設 5 時，logs 與 traces 每個請求都不超過 5 筆。關掉 detailed beta tracing 時，gzip 已另立一列（otlp-gzip-without-detailed），只剩批次上限還沒量過',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '開 OTel 與 detailed beta tracing 對本機接收端跑兩輪 claude -p。第一輪設 `OTEL_EXPORTER_OTLP_COMPRESSION=gzip`、`OTEL_EXPORTER_OTLP_LOGS_COMPRESSION=gzip` 與兩個批次上限 5，第二輪不設任何壓縮變數。成立的條件是第一輪 logs 與 traces 每個請求都帶 Content-Encoding: gzip 且筆數不超過 5，第二輪都不帶。只設通用壓縮變數時的 logs 結果，量到後另立一列。關掉 detailed beta tracing 時 gzip 已另立一列（otlp-gzip-without-detailed），只剩批次上限在關掉 detailed 時未驗',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless（`-p`），Claude Code 2.1.285，開著 detailed beta tracing 對本機接收端匯出。同時設 `OTEL_EXPORTER_OTLP_COMPRESSION=gzip`、`OTEL_EXPORTER_OTLP_LOGS_COMPRESSION=gzip` 與批次上限 5 時，26 個 logs 與 11 個 traces 請求都壓縮且不超過 5 筆。同樣約 125 筆 logs，gzip 後 50,435 B、不壓縮 229,133 B。不設批次上限時單一請求 79 筆、160,737 B',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-07' },
    },
  ),
  mf.statement(
    'otlp-gzip-without-detailed',
    '關掉 detailed beta tracing，並設 `OTEL_EXPORTER_OTLP_COMPRESSION=gzip` 與兩個批次上限 100 時，logs 與 traces 的請求各 1 個，都帶 `Content-Encoding: gzip`。批次上限在這個條件下還沒驗到，因為會話沒有接近 100 筆',
    {
      verify: {
        probe: {
          kind: 'manual',
          reason:
            '關掉 detailed beta tracing，設 `OTEL_EXPORTER_OTLP_COMPRESSION=gzip` 與兩個批次上限 100，對已部署的接收端跑一輪 claude -p。成立的條件是 logs 與 traces 的請求都帶 Content-Encoding: gzip。批次上限要跑到超過 100 筆的會話才驗得到',
        },
        verifiedOn: '2.1.285',
        screenedThrough: '2.1.285',
      },
      note: '本機 headless（`-p`），Claude Code 2.1.285，對已部署的接收端，一輪，logs 與 traces 各 1 個請求（各 n=1）',
      source: { kind: 'observed', basis: 'measured', fetched: '2026-10-09' },
    },
  ),
]
