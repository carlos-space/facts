import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateSchemaDocument } from 'fact-kit'
import type { Fact } from 'fact-kit'

const root = fileURLToPath(new URL('..', import.meta.url))
const read = async (entry: string) =>
  JSON.parse(await readFile(join(root, 'facts', entry, 'converted.json'), 'utf8')) as {
    describes?: Record<string, string>
    sdk?: { name: string; version: string }
    facts: Fact[]
  }
const schemaOf = (f: Fact) => (f.content as { schema: any }).schema

describe('github-actions conversion', async () => {
  const actions = await read('github-actions')

  it('converts the workflow schema', () => {
    const ids = actions.facts.map((f) => f.id)
    expect(ids).toEqual(['github-actions.workflow-syntax'])
    const workflow = schemaOf(actions.facts.find((f) => f.id === 'github-actions.workflow-syntax') as Fact)
    expect(Object.keys(workflow.properties)).toEqual(
      expect.arrayContaining(['on', 'jobs', 'permissions', 'concurrency']),
    )
  })

  it('records origin, pinned commit and license on every fact', () => {
    for (const fact of actions.facts) {
      expect(fact.source).toMatchObject({
        kind: 'converted',
        converter: 'packages/service-facts/github-actions/scripts/convert-github-actions.ts',
        upstream: expect.stringMatching(/^[0-9a-f]{40}$/),
      })
      const description = (fact.description as { en: string }).en
      expect(description, fact.id).toMatch(/Apache-2\.0|MIT/)
      expect(validateSchemaDocument(schemaOf(fact)), fact.id).toEqual([])
    }
  })
})
