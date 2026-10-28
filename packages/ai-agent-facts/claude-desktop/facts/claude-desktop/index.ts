import type { FactsModule } from 'fact-kit'
import { hookFacts } from './hook.ts'
import { modFacts } from './mod.ts'
import { desktopFacts } from './desktop.ts'
import { sessionFacts } from './session.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...hookFacts, ...modFacts, ...desktopFacts, ...sessionFacts],
}

export default entry
