// Converts GitHub sources into facts/github/converted.json:
// - the REST endpoints the observed github facts rely on, from github/rest-api-description (MIT)
// Usage: node scripts/convert-github.ts
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Fact } from 'fact-kit'
import { stableJson, writeFormatted } from '../../../../scripts/lib/format.ts'
import { normalizeSchema } from '../../../../scripts/lib/schema.ts'
import { readPinned, sourceUrl } from '../../../../scripts/lib/sources.ts'
import type { PinnedSource } from '../../../../scripts/lib/sources.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const CONVERTER = 'packages/service-facts/github/scripts/convert-github.ts'

export const GITHUB_REST: PinnedSource = {
  repo: 'github/rest-api-description',
  commit: '755ee33b4a81d51f6f07a902cce26cbec3b822f2',
  path: 'descriptions/api.github.com/api.github.com.2022-11-28.json',
  sha256: '309e30296b212d220ed143beeba216dbb0df11915daf79ee2ed01e06c6c9a586',
  license: 'MIT',
}

/**
 * The REST operations the observed github facts rely on, by operationId, and the fact that relies on it.
 * Only `github.squash-merge-message` names an endpoint, through the `squash_merge_commit_*` repository settings.
 */
export const ENDPOINTS: { operationId: string; usedBy: string }[] = [
  { operationId: 'repos/update', usedBy: 'github.squash-merge-message' },
]

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Replaces `#/components/...` references by their targets. A reference to a schema already being expanded becomes `{}`. */
function deref(value: unknown, doc: Obj, stack: string[] = [], cycles: string[] = []): unknown {
  if (Array.isArray(value)) return value.map((v) => deref(v, doc, stack, cycles))
  if (!isObj(value)) return value
  if (typeof value.$ref === 'string' && value.$ref.startsWith('#/')) {
    const ref = value.$ref
    if (stack.includes(ref)) {
      cycles.push(ref)
      return {}
    }
    const target = ref
      .slice(2)
      .split('/')
      .reduce<unknown>((node, key) => (isObj(node) ? node[key] : undefined), doc)
    if (target === undefined) throw new Error(`unresolved reference ${ref}`)
    return deref(target, doc, [...stack, ref], cycles)
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deref(v, doc, stack, cycles)]))
}

const notes = new Map<string, number>()
const OPENAPI_ONLY = ['example', 'xml', 'externalDocs', 'discriminator']

async function endpointFacts(): Promise<Fact[]> {
  const doc = JSON.parse(await readPinned(GITHUB_REST)) as Obj
  const paths = doc.paths as Record<string, Record<string, Obj>>
  const facts: Fact[] = []
  for (const { operationId, usedBy } of ENDPOINTS) {
    const found = Object.entries(paths).flatMap(([path, methods]) =>
      Object.entries(methods)
        .filter(([, op]) => isObj(op) && op.operationId === operationId)
        .map(([method, op]) => ({ path, method, op })),
    )
    if (found.length !== 1) throw new Error(`${operationId}: found ${found.length} operations`)
    const { path, method, op } = found[0] as (typeof found)[number]
    const cycles: string[] = []
    const parameters = deref(op.parameters ?? [], doc, [], cycles) as Obj[]
    const body = op.requestBody ? (deref(op.requestBody, doc, [], cycles) as Obj) : undefined
    const bodySchema =
      isObj(body?.content) && isObj(body.content['application/json'])
        ? body.content['application/json'].schema
        : undefined

    const properties: Obj = {}
    const required: string[] = []
    for (const where of ['path', 'query', 'header'] as const) {
      const list = parameters.filter((p) => p.in === where)
      if (list.length === 0) continue
      properties[where] = {
        type: 'object',
        properties: Object.fromEntries(
          list.map((p) => [
            p.name as string,
            { ...(isObj(p.schema) ? p.schema : {}), ...(p.description ? { description: p.description } : {}) },
          ]),
        ),
        required: list.filter((p) => p.required === true).map((p) => p.name as string),
      }
      if (list.some((p) => p.required === true)) required.push(where)
    }
    if (bodySchema) {
      properties.body = bodySchema
      if (body?.required === true) required.push('body')
    }
    const schema = normalizeSchema(
      { type: 'object', properties, ...(required.length > 0 ? { required } : {}) },
      { notes, drop: OPENAPI_ONLY },
    )
    facts.push({
      id: `github.rest.${operationId.replace(/\//g, '-')}`,
      tool: 'github',
      topics: ['rest-api', operationId.split('/')[0] as string],
      title: { en: `${method.toUpperCase()} ${path}` },
      description: {
        en: `${op.summary as string}. Request shape of the endpoint, converted from github/rest-api-description at ${GITHUB_REST.commit.slice(0, 7)} (API version 2022-11-28, ${GITHUB_REST.license}). The observed fact ${usedBy} relies on it.${cycles.length > 0 ? ` Recursive references were cut: ${[...new Set(cycles)].join(', ')}.` : ''}`,
      },
      content: { schema },
      source: { kind: 'converted', from: sourceUrl(GITHUB_REST), converter: CONVERTER, upstream: GITHUB_REST.commit },
    })
  }
  return facts
}

const facts = (await endpointFacts()).sort((a, b) => (a.id < b.id ? -1 : 1))
await writeFormatted(join(root, 'facts', 'github', 'converted.json'), `${stableJson({ facts })}\n`)
console.log(`converted ${facts.length} facts: ${facts.map((f) => f.id).join(', ')}`)
for (const [note, count] of [...notes].sort()) console.log(`  ${note}: ${count}`)
