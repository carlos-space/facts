import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { Fact } from 'fact-kit'
import { stripDescriptions } from '../scripts/convert-codex.ts'
import { observed } from '../facts/codex/observed.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const converted = JSON.parse(await readFile(join(root, 'facts', 'codex', 'converted.json'), 'utf8')) as {
  describes: Record<string, string>
  facts: Fact[]
}
const byId = new Map(converted.facts.map((f) => [f.id, f]))

describe('codex conversion from rust-v0.164.0', () => {
  it('describes codex 0.164.0 and records the tag commit on every fact', () => {
    expect(converted.describes).toEqual({ codex: '0.164.0' })
    for (const fact of converted.facts) {
      expect(fact.source).toMatchObject({
        kind: 'converted',
        converter: 'packages/ai-agent-facts/codex/scripts/convert-codex.ts',
        upstream: 'rust-v0.164.0 (6aaac694803004a63c6f393d153c96d22521a6b9)',
      })
    }
  })

  it('lists the 14 hook events and leaves out the state key', () => {
    const events = (byId.get('codex.hook-events')?.content as { value: string[] }).value
    expect(events).toHaveLength(14)
    expect(events).toContain('PreToolUse')
    expect(events).not.toContain('state')
  })

  it('has 13 hook inputs, 11 hook outputs and the config schema', () => {
    expect(converted.facts.filter((f) => f.id.startsWith('codex.hook-input.'))).toHaveLength(13)
    expect(converted.facts.filter((f) => f.id.startsWith('codex.hook-output.'))).toHaveLength(11)
    const schema = (byId.get('codex.config')?.content as { schema: any }).schema
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
    expect(Object.keys(schema.properties)).toHaveLength(103)
  })

  it('carries no upstream description text', () => {
    // Stripping again changes nothing. Two config fields are themselves named `description`, so a text search for the key would match them.
    for (const fact of converted.facts) expect(stripDescriptions(fact.content), fact.id).toEqual(fact.content)
  })

  it('keeps a property named description while dropping description text', () => {
    expect(
      stripDescriptions({ description: 'x', properties: { description: { type: 'string', description: 'y' } } }),
    ).toEqual({
      properties: { description: { type: 'string' } },
    })
  })

  it('has five AGENTS.md constants, each with a line-numbered source', () => {
    expect(observed).toHaveLength(5)
    for (const fact of observed) {
      expect((fact.source as { url: string }).url).toMatch(/\/codex-rs\/.+#L\d+$/)
    }
  })
})
