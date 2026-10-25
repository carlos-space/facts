import type { FactsModule } from '../../../fact-kit/src/index.ts'
import { observed } from './observed.ts'

const entry: FactsModule = { describes: {}, facts: observed }

export default entry
