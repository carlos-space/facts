import type { FactsModule } from 'fact-kit'
import { releaseFacts } from './release.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...releaseFacts],
}

export default entry
