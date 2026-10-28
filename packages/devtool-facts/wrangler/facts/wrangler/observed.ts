import type { Fact } from 'fact-kit'

export const observed: Fact[] = [
  {
    id: 'wrangler.auth-env',
    tool: 'wrangler',
    topics: ['wrangler', 'ci', 'auth'],
    title: 'wrangler 在 CI 的認證',
    content: {
      statement:
        'wrangler 讀環境變數 `CLOUDFLARE_API_TOKEN` 當 API token 認證，CI 與自動化用這個，不用 `wrangler login`。`CLOUDFLARE_ACCOUNT_ID` 指定帳號',
    },
    source: {
      kind: 'observed',
      basis: 'doc',
      url: 'https://developers.cloudflare.com/workers/wrangler/system-environment-variables/',
      fetched: '2026-10-26',
    },
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'can be used for authentication for situations like CI/CD',
        hash: 'sha256:970c7edca38988da',
      },
      verifiedOn: '2026-10-26',
      screenedThrough: '2026-10-26',
    },
  },
  {
    id: 'wrangler.object-local-default',
    tool: 'wrangler',
    topics: ['wrangler', 'cli'],
    title: 'wrangler r2 object 預設存取本機',
    content: {
      statement:
        '`wrangler r2 object get`、`put` 沒帶 `--remote` 時存取本機模擬的 bucket，不碰 Cloudflare 上的 bucket。讀不到的 key 回 `The specified key does not exist.`。要讀寫線上 bucket 一律帶 `--remote`',
    },
    source: {
      kind: 'observed',
      basis: 'measured',
      fetched: '2026-10-26',
      note: 'wrangler 4.147.0。不帶 `--remote` 讀線上已存在的 `carlos209310-downloads/notchhub/ping.txt`，log 走 `usingLocalBucket`，錯誤是 `r2 object get local key not found`；帶 `--remote` 讀得到。指令文件只寫 `--local`、`--remote` 兩個旗標，沒寫預設',
    },
    verify: {
      probe: {
        kind: 'manual',
        reason:
          '要 Cloudflare 登入與一個有物件的 bucket。對已存在的物件跑 `wrangler r2 object get <bucket>/<key> --pipe` 一次，再加 `--remote` 跑一次。成立的條件是前者回 key 不存在、後者印出內容',
      },
      verifiedOn: '4.147.0',
      screenedThrough: '4.147.0',
    },
  },
]
