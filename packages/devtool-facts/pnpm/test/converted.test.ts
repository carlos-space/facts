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

describe('pnpm conversion', async () => {
  const pnpm = await read('pnpm')

  it('converts the pnpm-workspace.yaml fields', () => {
    expect(pnpm.facts.map((f) => f.id)).toEqual(['pnpm.workspace-yaml'])
    expect(Object.keys(schemaOf(pnpm.facts[0] as Fact).properties)).toEqual(
      expect.arrayContaining(['packages', 'catalog', 'onlyBuiltDependencies']),
    )
  })

  it('records origin, pinned commit and license on every fact', () => {
    for (const fact of pnpm.facts) {
      expect(fact.source).toMatchObject({
        kind: 'converted',
        converter: 'packages/devtool-facts/pnpm/scripts/convert-pnpm.ts',
        upstream: expect.stringMatching(/^[0-9a-f]{40}$/),
      })
      const description = (fact.description as { en: string }).en
      expect(description, fact.id).toMatch(/Apache-2\.0|MIT/)
      expect(validateSchemaDocument(schemaOf(fact)), fact.id).toEqual([])
    }
  })
})
