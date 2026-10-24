// Mapping between the workspace's `ExternalFact` rows and `Fact`, and the field-by-field comparison.
// Decision d005: migrated rows keep their original id and content. Nothing here rewrites a value.
import { homedir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Fact, FactIndex, FactProbe } from '../../../fact-kit/src/index.ts'

/** The five tables of the workspace, each exporting `PLATFORM_FACTS`. */
export const LEGACY_TABLES = [
  'prompt-governance',
  'version-control',
  'collaboration',
  'measurement',
  'mainline',
] as const
export type LegacyTable = (typeof LEGACY_TABLES)[number]

/** One row as the workspace declares it (`ExternalFact`, plus `tool` and `topic` in the version-control table). */
export interface LegacyRow {
  id: string
  platform: string
  topics: readonly string[]
  fact: string
  sourceKind: 'doc' | 'measured' | 'spike'
  source: string
  probe: FactProbe
  verifiedOn: string
  screenedThrough: string
  fetched: string
  tool?: string
  topic?: string
}

export interface LegacyRowOf extends LegacyRow {
  table: LegacyTable
}

/** What a migrated fact does not carry (the workspace's presentation: table and tool label). Keyed by the new fact id in `migration/legacy-fields.json`. */
export interface LegacySidecar {
  table: LegacyTable
  /** The original id, before the `<platform>.` prefix. */
  id: string
  /** The `tool` column of the version-control table (`GitHub`, `pnpm`, ...). */
  tool?: string
}

export const defaultWorkspace = (): string => join(homedir(), 'workspace')

/** Loads the five tables by importing them from the workspace (Node type stripping, resolved from there). */
export async function loadLegacyRows(workspace: string): Promise<LegacyRowOf[]> {
  const rows: LegacyRowOf[] = []
  for (const table of LEGACY_TABLES) {
    const file = join(workspace, 'prompts', 'user', table, '_lib', 'platform-facts.ts')
    const mod = (await import(pathToFileURL(file).href)) as { PLATFORM_FACTS: readonly LegacyRow[] }
    for (const row of mod.PLATFORM_FACTS) rows.push({ table, ...row })
  }
  return rows
}

const URL_ONLY = /^https?:\/\/[^\s、]+$/

/** The URL list of a `source` made only of URLs joined with 、, or undefined for free text. */
export function sourceUrls(source: string): string[] | undefined {
  const parts = source.split('、')
  return parts.every((p) => URL_ONLY.test(p)) ? parts : undefined
}

export const factId = (row: Pick<LegacyRow, 'platform' | 'id'>): string => `${row.platform}.${row.id}`

/** Version-control rows carry a Chinese `topic` label, which becomes the title. The others use the original id. */
const titleOf = (row: LegacyRow): string => row.topic ?? row.id

export function toFact(row: LegacyRow): { fact: Fact; sidecar: Omit<LegacySidecar, 'table'> } {
  const urls = sourceUrls(row.source)
  const url = urls?.[0]
  const fact: Fact = {
    id: factId(row),
    tool: row.platform,
    topics: [...row.topics],
    title: titleOf(row),
    content: { statement: row.fact },
    source: {
      kind: 'observed',
      basis: row.sourceKind,
      ...(url ? { url } : {}),
      fetched: row.fetched,
      // The original text, kept as the note only when `source.url` does not carry it exactly.
      ...(row.source !== url ? { note: row.source } : {}),
    },
    verify: { probe: row.probe, verifiedOn: row.verifiedOn, screenedThrough: row.screenedThrough },
  }
  const sidecar: Omit<LegacySidecar, 'table'> = {
    id: row.id,
    ...(row.tool !== undefined ? { tool: row.tool } : {}),
  }
  return { fact, sidecar }
}

export interface Difference {
  id: string
  field: string
  expected: unknown
  actual: unknown
}

export interface CompareResult {
  total: number
  matched: number
  /** Rows with at least one difference. */
  mismatched: number
  differences: Difference[]
}

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

/** What the migrated fact and its sidecar should say about `row`, read back as the original columns. */
function readBack(fact: Fact, sidecar: LegacySidecar | undefined) {
  const source = fact.source.kind === 'observed' ? fact.source : undefined
  return {
    id: sidecar?.id !== undefined && fact.id === `${fact.tool}.${sidecar.id}` ? sidecar.id : undefined,
    platform: fact.tool,
    topics: fact.topics,
    fact: 'statement' in fact.content ? fact.content.statement : undefined,
    sourceKind: source?.basis,
    source: source?.note ?? source?.url,
    probe: fact.verify?.probe,
    verifiedOn: fact.verify?.verifiedOn,
    screenedThrough: fact.verify?.screenedThrough,
    fetched: source?.fetched,
    tool: sidecar?.tool,
    topic: sidecar?.tool !== undefined ? fact.title : undefined,
    table: sidecar?.table,
    title: fact.title,
  }
}

/**
 * Compares every row with the fact it migrated to, column by column. `facts` are looked up by the new id,
 * so a row whose fact is missing reports one difference on the field `fact`.
 */
export function compareMigration(
  rows: readonly LegacyRowOf[],
  facts: ReadonlyMap<string, Fact>,
  sidecars: Readonly<Record<string, LegacySidecar>>,
): CompareResult {
  const differences: Difference[] = []
  const bad = new Set<string>()
  const note = (id: string, field: string, expected: unknown, actual: unknown) => {
    if (same(expected, actual)) return
    differences.push({ id, field, expected, actual })
    bad.add(id)
  }
  for (const row of rows) {
    const id = factId(row)
    const fact = facts.get(id)
    if (!fact) {
      differences.push({ id, field: 'fact', expected: 'present', actual: 'missing' })
      bad.add(id)
      continue
    }
    const sidecar = sidecars[id]
    const back = readBack(fact, sidecar)
    note(id, 'id', row.id, back.id)
    note(id, 'platform', row.platform, back.platform)
    note(id, 'topics', row.topics, back.topics)
    note(id, 'fact', row.fact, back.fact)
    note(id, 'sourceKind', row.sourceKind, back.sourceKind)
    note(id, 'source', row.source, back.source)
    note(id, 'source.url', sourceUrls(row.source)?.[0], fact.source.kind === 'observed' ? fact.source.url : undefined)
    note(id, 'probe', row.probe, back.probe)
    note(id, 'verifiedOn', row.verifiedOn, back.verifiedOn)
    note(id, 'screenedThrough', row.screenedThrough, back.screenedThrough)
    note(id, 'fetched', row.fetched, back.fetched)
    note(id, 'tool', row.tool, back.tool)
    note(id, 'topic', row.topic, back.topic)
    note(id, 'table', row.table, back.table)
    note(id, 'title', row.topic ?? row.id, back.title)
  }
  return { total: rows.length, matched: rows.length - bad.size, mismatched: bad.size, differences }
}

/** All facts of the built entries, by id. */
export function factsById(indexes: readonly Pick<FactIndex, 'facts'>[]): Map<string, Fact> {
  const out = new Map<string, Fact>()
  for (const index of indexes) for (const fact of index.facts) out.set(fact.id, fact)
  return out
}
