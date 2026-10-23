import type { Fact, FactsModule } from '../../../fact-kit/src/index.ts'
import converted from './converted.json' with { type: 'json' }
import { observed } from './observed.ts'
import { paths } from './paths.ts'

// `converted.json` is written by scripts/convert-claude-code.ts from the pinned SDK; `describes` is the
// Claude Code version that SDK release is built for.
const entry: FactsModule = {
  describes: converted.describes,
  facts: [...observed, ...paths, ...(converted.facts as Fact[])],
}

export default entry
