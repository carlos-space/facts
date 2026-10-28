import type { Fact, FactsModule } from 'fact-kit'
import converted from './converted.json' with { type: 'json' }
import { issueFacts } from './issue.ts'
import { issueLinkingFacts } from './issue-linking.ts'
import { codeownersFacts } from './codeowners.ts'
import { rulesetFacts } from './ruleset.ts'
import { branchProtectionFacts } from './branch-protection.ts'
import { squashFacts } from './squash.ts'

// `converted.json` is written by scripts/convert-github.ts from pinned upstream files.
const entry: FactsModule = {
  describes: {},
  facts: [
    ...issueFacts,
    ...issueLinkingFacts,
    ...codeownersFacts,
    ...rulesetFacts,
    ...branchProtectionFacts,
    ...squashFacts,
    ...(converted.facts as Fact[]),
  ],
}

export default entry
