import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'gfm',
  topics: ['markdown'],
  source: observedDoc({ url: 'https://github.github.com/gfm/', fetched: '2026-09-30' }),
})

export const markdownFacts = [
  mf.statement('strikethrough', 'GFM 把一個或兩個 `~` 成對包住的文字渲染成刪除線。', {
    title: 'gfm-strikethrough',
    verify: {
      probe: {
        kind: 'hash',
        anchor: 'Strikethrough text is any text wrapped in a matching pair',
        hash: 'sha256:6fda8ed5447ecf45',
      },
      verifiedOn: '2026-09-30',
      screenedThrough: '2026-09-30',
    },
  }),
]
