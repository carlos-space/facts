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

describe('github conversion', async () => {
  const github = await read('github')

  it('converts the REST endpoint the observed facts use', () => {
    const ids = github.facts.map((f) => f.id)
    expect(ids).toEqual(['github.rest.repos-update'])
    const update = schemaOf(github.facts.find((f) => f.id === 'github.rest.repos-update') as Fact)
    expect(Object.keys(update.properties.body.properties)).toEqual(
      expect.arrayContaining(['squash_merge_commit_title', 'squash_merge_commit_message']),
    )
    expect(update.required).toContain('path')
  })

  it('records origin, pinned commit and license on every fact', () => {
    for (const fact of github.facts) {
      expect(fact.source).toMatchObject({
        kind: 'converted',
        converter: 'packages/service-facts/github/scripts/convert-github.ts',
        upstream: expect.stringMatching(/^[0-9a-f]{40}$/),
      })
      const description = (fact.description as { en: string }).en
      expect(description, fact.id).toMatch(/Apache-2\.0|MIT/)
      expect(validateSchemaDocument(schemaOf(fact)), fact.id).toEqual([])
    }
  })
})
