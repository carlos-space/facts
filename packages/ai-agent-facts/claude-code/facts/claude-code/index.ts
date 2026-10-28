import type { Fact, FactsModule } from 'fact-kit'
import converted from './converted.json' with { type: 'json' }
import { hookFacts } from './hook.ts'
import { permissionFacts } from './permission.ts'
import { skillFacts } from './skill.ts'
import { subagentFacts } from './subagent.ts'
import { ruleFacts } from './rule.ts'
import { memoryFacts } from './memory.ts'
import { headlessFacts } from './headless.ts'
import { authenticationFacts } from './authentication.ts'
import { modFacts } from './mod.ts'
import { commitFacts } from './commit.ts'
import { timeoutFacts } from './timeout.ts'
import { sessionFacts } from './session.ts'
import { telemetryFacts } from './telemetry.ts'
import { environmentFacts } from './environment.ts'
import { agentFacts } from './agent.ts'
import { settingsFacts } from './settings.ts'
import { mcpFacts } from './mcp.ts'
import { pluginFacts } from './plugin.ts'

// `converted.json` is written by scripts/convert-claude-code.ts from the pinned SDK; `describes` is the
// Claude Code version that SDK release is built for.
const entry: FactsModule = {
  describes: converted.describes,
  facts: [
    ...hookFacts,
    ...permissionFacts,
    ...skillFacts,
    ...subagentFacts,
    ...ruleFacts,
    ...memoryFacts,
    ...headlessFacts,
    ...authenticationFacts,
    ...modFacts,
    ...commitFacts,
    ...timeoutFacts,
    ...sessionFacts,
    ...telemetryFacts,
    ...environmentFacts,
    ...agentFacts,
    ...settingsFacts,
    ...mcpFacts,
    ...pluginFacts,
    ...(converted.facts as Fact[]),
  ],
}

export default entry
