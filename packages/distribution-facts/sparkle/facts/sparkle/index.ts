import type { FactsModule } from 'fact-kit'
import { infoPlistFacts } from './info-plist.ts'
import { sandboxFacts } from './sandbox.ts'
import { codesignFacts } from './codesign.ts'
import { versionFacts } from './version.ts'
import { eddsaFacts } from './eddsa.ts'
import { appcastFacts } from './appcast.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...infoPlistFacts, ...sandboxFacts, ...codesignFacts, ...versionFacts, ...eddsaFacts, ...appcastFacts],
}

export default entry
