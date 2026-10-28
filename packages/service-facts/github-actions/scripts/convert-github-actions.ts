// Converts the workflow file schema of GitHub Actions into facts/github-actions/converted.json, from SchemaStore's
// github-workflow.json (Apache-2.0)
// Usage: node scripts/convert-github-actions.ts
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Fact, JsonSchema } from 'fact-kit'
import { stableJson, writeFormatted } from '../../../../scripts/lib/format.ts'
import { normalizeSchema } from '../../../../scripts/lib/schema.ts'
import { readPinned, sourceUrl } from '../../../../scripts/lib/sources.ts'
import type { PinnedSource } from '../../../../scripts/lib/sources.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const CONVERTER = 'packages/service-facts/github-actions/scripts/convert-github-actions.ts'

export const GITHUB_WORKFLOW: PinnedSource = {
  repo: 'SchemaStore/schemastore',
  commit: 'd227d9f54eaf1a805de6c00e94c939f526a3da2f',
  path: 'src/schemas/json/github-workflow.json',
  sha256: 'd10c9f4656e1bd5bc6727e9b35080e017dc167154726fca93da33c7a6bd1c4f3',
  license: 'Apache-2.0',
}

const notes = new Map<string, number>()

async function workflowFact(): Promise<Fact> {
  const schema = normalizeSchema(JSON.parse(await readPinned(GITHUB_WORKFLOW)) as JsonSchema, { notes })
  return {
    id: 'github-actions.workflow-syntax',
    tool: 'github-actions',
    topics: ['workflow', 'actions'],
    title: { en: 'Workflow file fields' },
    description: {
      en: `Fields of a GitHub Actions workflow file, converted from SchemaStore's github-workflow.json at ${GITHUB_WORKFLOW.commit.slice(0, 7)}. SchemaStore is licensed ${GITHUB_WORKFLOW.license}. The schema is community-maintained, so GitHub can add keys before it does.`,
    },
    content: { schema },
    source: {
      kind: 'converted',
      from: sourceUrl(GITHUB_WORKFLOW),
      converter: CONVERTER,
      upstream: GITHUB_WORKFLOW.commit,
    },
  }
}

const facts = [await workflowFact()]
await writeFormatted(join(root, 'facts', 'github-actions', 'converted.json'), `${stableJson({ facts })}\n`)
console.log(`converted ${facts.length} facts: ${facts.map((f) => f.id).join(', ')}`)
for (const [note, count] of [...notes].sort()) console.log(`  ${note}: ${count}`)
