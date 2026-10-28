import type { FactsModule } from 'fact-kit'
import { ghCliFacts } from './gh-cli.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...ghCliFacts],
}

export default entry
