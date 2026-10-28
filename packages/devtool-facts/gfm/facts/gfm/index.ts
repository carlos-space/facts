import type { FactsModule } from 'fact-kit'
import { markdownFacts } from './markdown.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...markdownFacts],
}

export default entry
