import type { Fact, FactsModule } from '../../../fact-kit/src/index.ts'
import converted from './converted.json' with { type: 'json' }
import { observed } from './observed.ts'

// `converted.json` is written by scripts/convert-github.ts from pinned upstream files.
const entry: FactsModule = { describes: {}, facts: [...observed, ...(converted.facts as Fact[])] }

export default entry
