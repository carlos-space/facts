import type { Fact, FactsModule } from '../../../fact-kit/src/index.ts'
import converted from './converted.json' with { type: 'json' }
import { observed } from './observed.ts'
import { paths } from './paths.ts'

// `converted.json` is written by scripts/convert-codex.ts from the pinned openai/codex tag; `describes` is
// the Codex version of that tag.
const entry: FactsModule = {
  describes: converted.describes,
  facts: [...observed, ...paths, ...(converted.facts as Fact[])],
}

export default entry
