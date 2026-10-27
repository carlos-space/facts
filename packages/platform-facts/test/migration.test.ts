import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadEntries } from 'fact-kit'
import { compareMigration, defaultWorkspace, factsById, loadLegacyRows, toFact } from '../scripts/lib/legacy.ts'
import type { LegacyRowOf, LegacySidecar } from '../scripts/lib/legacy.ts'
import type { Fact } from 'fact-kit'

const root = fileURLToPath(new URL('..', import.meta.url))
const workspace = process.env.LEGACY_WORKSPACE ?? defaultWorkspace()
const hasWorkspace = existsSync(join(workspace, 'prompts', 'user', 'mainline', '_lib', 'platform-facts.ts'))

const entries = await loadEntries(join(root, 'facts'))
const allFacts = factsById(entries.map((e) => e.module))
const sidecars = JSON.parse(await readFile(join(root, 'migration', 'legacy-fields.json'), 'utf8')) as Record<
  string,
  LegacySidecar
>

/** Reads the original columns back from a migrated fact; the inverse of `toFact`. */
function rowOf(id: string): LegacyRowOf {
  const fact = allFacts.get(id) as Fact
  const side = sidecars[id] as LegacySidecar
  if (!('statement' in fact.content) || fact.source.kind !== 'observed' || !fact.verify) throw new Error(id)
  return {
    table: side.table,
    id: side.id,
    platform: fact.tool,
    topics: fact.topics,
    fact: fact.content.statement as string,
    sourceKind: fact.source.basis,
    source: (fact.source.note ?? fact.source.url) as string,
    probe: fact.verify.probe,
    verifiedOn: fact.verify.verifiedOn,
    screenedThrough: fact.verify.screenedThrough as string,
    fetched: fact.source.fetched as string,
    ...(side.tool !== undefined ? { tool: side.tool, topic: fact.title as string } : {}),
  }
}

describe('migration comparison', () => {
  const rows = Object.keys(sidecars).map(rowOf)

  it('has the 169 migrated rows', () => {
    expect(rows).toHaveLength(169)
  })

  it('reports no difference when nothing changed', () => {
    const result = compareMigration(rows, allFacts, sidecars)
    expect(result).toMatchObject({ total: 169, matched: 169, mismatched: 0, differences: [] })
  })

  it('reports exactly one row when one original column is changed', () => {
    const broken = rows.map((r, i) => (i === 7 ? { ...r, fact: `${r.fact}!` } : r))
    const result = compareMigration(broken, allFacts, sidecars)
    expect(result.mismatched).toBe(1)
    expect(result.matched).toBe(168)
    expect(result.differences.map((d) => d.field)).toEqual(['fact'])
  })

  it('reports exactly one row when one migrated fact is changed', () => {
    const victim = rows[3] as LegacyRowOf
    const id = `${victim.platform}.${victim.id}`
    const facts = new Map(allFacts)
    const fact = facts.get(id) as Fact
    facts.set(id, { ...fact, verify: { ...(fact.verify as NonNullable<Fact['verify']>), verifiedOn: '1999-01-01' } })
    const result = compareMigration(rows, facts, sidecars)
    expect(result.mismatched).toBe(1)
    expect(result.differences.map((d) => d.field)).toEqual(['verifiedOn'])
  })

  it('reports the note and the fetched date when either one is changed on the fact', () => {
    const victim = rows.find((r) => r.sourceKind === 'measured') as LegacyRowOf
    const id = `${victim.platform}.${victim.id}`
    const fact = allFacts.get(id) as Fact
    const source = fact.source as Extract<Fact['source'], { kind: 'observed' }>
    expect(source.note).toBeTruthy()
    expect(source.fetched).toBeTruthy()
    const changed = (patch: object) => new Map(allFacts).set(id, { ...fact, source: { ...source, ...patch } })
    const note = compareMigration(rows, changed({ note: 'other' }), sidecars)
    expect(note.differences.map((d) => d.field)).toEqual(['source'])
    const fetched = compareMigration(rows, changed({ fetched: '1999-01-01' }), sidecars)
    expect(fetched.differences.map((d) => d.field)).toEqual(['fetched'])
  })

  it('reports a row whose fact is missing, and a dropped sidecar column', () => {
    const facts = new Map(allFacts)
    const victim = rows[0] as LegacyRowOf
    facts.delete(`${victim.platform}.${victim.id}`)
    expect(compareMigration(rows, facts, sidecars).mismatched).toBe(1)

    const other = rows[1] as LegacyRowOf
    const trimmed = { ...sidecars }
    delete trimmed[`${other.platform}.${other.id}`]
    expect(compareMigration(rows, allFacts, trimmed).mismatched).toBeGreaterThanOrEqual(1)
  })
})

describe.skipIf(!hasWorkspace)('against the workspace tables', () => {
  it('matches all 169 rows', async () => {
    const legacy = await loadLegacyRows(workspace)
    const result = compareMigration(legacy, allFacts, sidecars)
    expect(result.differences).toEqual([])
    expect(result).toMatchObject({ total: 169, matched: 169, mismatched: 0 })
  })

  it('maps every row the way toFact does', async () => {
    for (const row of await loadLegacyRows(workspace)) {
      const { fact } = toFact(row)
      expect(allFacts.get(fact.id)).toEqual(fact)
    }
  })
})
