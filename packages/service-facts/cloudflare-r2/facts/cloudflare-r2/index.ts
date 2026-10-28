import type { FactsModule } from 'fact-kit'
import { customDomainFacts } from './custom-domain.ts'
import { cacheFacts } from './cache.ts'
import { pricingFacts } from './pricing.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...customDomainFacts, ...cacheFacts, ...pricingFacts],
}

export default entry
