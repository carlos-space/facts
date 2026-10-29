import type { FactsModule } from 'fact-kit'
import { storageFacts } from './storage.ts'
import { lifecycleFacts } from './lifecycle.ts'
import { imagesFacts } from './images.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...storageFacts, ...lifecycleFacts, ...imagesFacts],
}

export default entry
