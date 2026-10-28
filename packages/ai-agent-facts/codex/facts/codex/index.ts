import type { Fact, FactsModule } from 'fact-kit'
import converted from './converted.json' with { type: 'json' }
import { agentsMdFacts } from './agents-md.ts'
import { agentFacts } from './agent.ts'
import { skillFacts } from './skill.ts'
import { hookFacts } from './hook.ts'
import { rulesFacts } from './rules.ts'
import { configFacts } from './config.ts'

// `converted.json` is written by scripts/convert-codex.ts from the pinned openai/codex tag; `describes` is
// the Codex version of that tag.
const entry: FactsModule = {
  describes: converted.describes,
  facts: [
    ...agentsMdFacts,
    ...agentFacts,
    ...skillFacts,
    ...hookFacts,
    ...rulesFacts,
    ...configFacts,
    ...(converted.facts as Fact[]),
  ],
}

export default entry
