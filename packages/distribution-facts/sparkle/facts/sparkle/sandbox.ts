import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'sparkle',
  topics: ['sandbox'],
  source: observedDoc({ url: 'https://sparkle-project.org/documentation/sandboxing/', fetched: '2026-10-26' }),
})

export const sandboxFacts = [
  mf.statement(
    'remove-xpc-services',
    '不開沙盒、也沒啟用 XPC services 的 app，可以在把 `Sparkle.framework` 複製進 app 後刪掉 framework 裡的 XPC services，或從原始碼建置時不嵌入它們',
    {
      title: '不開沙盒時可移除 XPC services',
      topics: ['xpc', 'packaging'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'you may choose to remove these services in a post install script',
          hash: 'sha256:42af7af5a1d89c82',
        },
        verifiedOn: '2026-10-26',
        screenedThrough: '2026-10-26',
      },
    },
  ),
]
