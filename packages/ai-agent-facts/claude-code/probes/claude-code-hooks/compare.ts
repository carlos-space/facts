// Compares captured hook inputs with the JSON Schemas converted from the SDK (facts/claude-code/converted.json).
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Ajv2020 } from 'ajv/dist/2020.js'
import { EVENT_TABLE } from './event-table.ts'

const root = fileURLToPath(new URL('../..', import.meta.url))

export interface ConvertedFile {
  describes?: Record<string, string>
  facts: { id: string; content: { value?: unknown; schema?: Record<string, unknown> } }[]
}

export const readConverted = async (): Promise<ConvertedFile> =>
  JSON.parse(await readFile(join(root, 'facts', 'claude-code', 'converted.json'), 'utf8')) as ConvertedFile

/** `PreToolUse` -> `claude-code.hook-input.pre-tool-use` */
export const hookInputId = (event: string): string =>
  `claude-code.hook-input.${event.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`

export interface EventResult {
  event: string
  /** How many captured inputs were compared. */
  captures: number
  /** Property paths present in the input, but not in the schema. */
  extra: string[]
  /** Required properties the input lacks. */
  missing: string[]
  /** Values whose type or value does not fit the schema, as `path: message`. */
  mismatched: string[]
}

export interface Capture {
  run: string
  file: string
  event: string
  input: unknown
}

/** Reads every capture under `<capturesRoot>/<run>/`. */
export async function readCaptures(capturesRoot: string): Promise<Capture[]> {
  const out: Capture[] = []
  for (const run of await readdir(capturesRoot).catch(() => [] as string[])) {
    for (const file of (await readdir(join(capturesRoot, run))).sort()) {
      if (!file.endsWith('.json')) continue
      const body = JSON.parse(await readFile(join(capturesRoot, run, file), 'utf8')) as {
        __event: string
        input: unknown
      }
      out.push({ run, file, event: body.__event, input: body.input })
    }
  }
  return out
}

/** Validates the captures of each event against the schema of that event's hook input. */
export function compareCaptures(
  converted: ConvertedFile,
  events: readonly string[],
  captures: readonly Capture[],
): EventResult[] {
  const ajv = new Ajv2020({ strict: false, allErrors: true })
  const schemas = new Map(converted.facts.map((f) => [f.id, f.content.schema]))
  return events.map((event) => {
    const mine = captures.filter((c) => c.event === event)
    const result: EventResult = { event, captures: mine.length, extra: [], missing: [], mismatched: [] }
    const schema = schemas.get(hookInputId(event))
    if (!schema || mine.length === 0) return result
    const validate = ajv.compile(schema)
    const add = (list: string[], text: string) => {
      if (!list.includes(text)) list.push(text)
    }
    for (const capture of mine) {
      if (validate(capture.input)) continue
      for (const error of validate.errors ?? []) {
        const path = (error.instancePath || '').replace(/^\//, '').replaceAll('/', '.')
        const join2 = (name: unknown) => (path ? `${path}.${String(name)}` : String(name))
        if (error.keyword === 'additionalProperties') add(result.extra, join2(error.params.additionalProperty))
        else if (error.keyword === 'required') add(result.missing, join2(error.params.missingProperty))
        else add(result.mismatched, `${path || '(root)'}: ${error.message ?? error.keyword}`)
      }
    }
    return result
  })
}

export interface ReportRow extends EventResult {
  /** `compared` when the event fired, `not fired` when a reachable event did not, `unreachable` otherwise. */
  status: 'compared' | 'not fired' | 'unreachable'
  note?: string
}

/** Joins the comparison with the event table, so every event has a row and every missing one has a reason. */
export function buildReport(results: readonly EventResult[]): ReportRow[] {
  return results.map((r) => {
    const entry = EVENT_TABLE[r.event]
    if (r.captures > 0) return { ...r, status: 'compared' as const }
    if (entry?.run === null)
      return { ...r, status: 'unreachable' as const, ...(entry.unreachable ? { note: entry.unreachable } : {}) }
    return {
      ...r,
      status: 'not fired' as const,
      note: `expected from run ${entry?.run}: ${entry?.how}${entry?.notFired ? `. ${entry.notFired}` : ''}`,
    }
  })
}

export function formatReport(rows: readonly ReportRow[]): string {
  const lines = ['event | status | captures | extra | missing | mismatched / note', '--- | --- | --- | --- | --- | ---']
  for (const r of rows) {
    const detail = r.status === 'compared' ? r.mismatched.join('; ') || '-' : (r.note ?? '-')
    lines.push(
      `${r.event} | ${r.status} | ${r.captures} | ${r.extra.join(', ') || '-'} | ${r.missing.join(', ') || '-'} | ${detail}`,
    )
  }
  const compared = rows.filter((r) => r.status === 'compared')
  lines.push(
    '',
    `compared ${compared.length} of ${rows.length} events; ` +
      `not fired ${rows.filter((r) => r.status === 'not fired').length}; unreachable ${rows.filter((r) => r.status === 'unreachable').length}`,
    `events with extra properties: ${compared.filter((r) => r.extra.length > 0).length}; with missing required: ${compared.filter((r) => r.missing.length > 0).length}; with mismatches: ${compared.filter((r) => r.mismatched.length > 0).length}`,
  )
  return lines.join('\n')
}
