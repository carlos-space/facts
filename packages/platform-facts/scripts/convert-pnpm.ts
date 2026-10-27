// Converts SchemaStore's pnpm-workspace.json (Apache-2.0) into facts/pnpm/converted.json.
// Usage: node scripts/convert-pnpm.ts
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Fact, JsonSchema } from 'fact-kit'
import { stableJson, writeFormatted } from './lib/format.ts'
import { normalizeSchema } from './lib/schema.ts'
import { readPinned, sourceUrl } from './lib/sources.ts'
import type { PinnedSource } from './lib/sources.ts'

const root = fileURLToPath(new URL('..', import.meta.url))

export const PNPM_WORKSPACE: PinnedSource = {
  repo: 'SchemaStore/schemastore',
  commit: 'd227d9f54eaf1a805de6c00e94c939f526a3da2f',
  path: 'src/schemas/json/pnpm-workspace.json',
  sha256: '7eecf631fc469a03bbd7ad505587dad76247d2c155fe1012695d5a1332346e1a',
  license: 'Apache-2.0',
}

const notes = new Map<string, number>()
const schema = normalizeSchema(JSON.parse(await readPinned(PNPM_WORKSPACE)) as JsonSchema, { notes })

const fact: Fact = {
  id: 'pnpm.workspace-yaml',
  tool: 'pnpm',
  topics: ['workspace', 'settings'],
  title: { en: 'pnpm-workspace.yaml fields' },
  description: {
    en: `Fields of pnpm-workspace.yaml, converted from SchemaStore's pnpm-workspace.json at ${PNPM_WORKSPACE.commit.slice(0, 7)}. SchemaStore is licensed ${PNPM_WORKSPACE.license}. The schema is community-maintained, so a pnpm release can add settings before it does.`,
  },
  content: { schema },
  source: {
    kind: 'converted',
    from: sourceUrl(PNPM_WORKSPACE),
    converter: 'packages/platform-facts/scripts/convert-pnpm.ts',
    upstream: PNPM_WORKSPACE.commit,
  },
}

await writeFormatted(join(root, 'facts', 'pnpm', 'converted.json'), `${stableJson({ facts: [fact] })}\n`)
console.log(`converted 1 fact (${Object.keys((schema as { properties: object }).properties).length} top-level fields)`)
for (const [note, count] of [...notes].sort()) console.log(`  ${note}: ${count}`)
