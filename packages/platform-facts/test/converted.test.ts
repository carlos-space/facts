import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'
import { readStringTuplesFromFile, validateSchemaDocument } from '../../fact-kit/src/index.ts'
import type { Fact } from '../../fact-kit/src/index.ts'
import { normalizeSchema } from '../scripts/lib/schema.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const sdkDir = join(root, 'node_modules', '@anthropic-ai', 'claude-agent-sdk')
const read = async (entry: string) =>
  JSON.parse(await readFile(join(root, 'facts', entry, 'converted.json'), 'utf8')) as {
    describes?: Record<string, string>
    sdk?: { name: string; version: string }
    facts: Fact[]
  }
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const schemaOf = (f: Fact) => (f.content as { schema: any }).schema
const valueOf = (f: Fact) => (f.content as { value: unknown }).value

describe('claude-code conversion from the SDK', async () => {
  const converted = await read('claude-code')
  const sdkPackage = JSON.parse(await readFile(join(sdkDir, 'package.json'), 'utf8')) as {
    version: string
    claudeCodeVersion: string
  }
  const byId = new Map(converted.facts.map((f) => [f.id, f]))
  const events = (await readStringTuplesFromFile(join(sdkDir, 'sdk.d.ts'))).HOOK_EVENTS as string[]

  it('pins SDK 0.3.308 and describes Claude Code 2.1.308', () => {
    expect(sdkPackage.version).toBe('0.3.308')
    expect(converted.sdk).toEqual({ name: '@anthropic-ai/claude-agent-sdk', version: '0.3.308' })
    expect(converted.describes).toEqual({ 'claude-code': '2.1.308' })
    expect(sdkPackage.claudeCodeVersion).toBe('2.1.308')
  })

  it('lists the 33 hook events of HOOK_EVENTS', () => {
    const fact = byId.get('claude-code.hook-events') as Fact
    expect(valueOf(fact)).toEqual(events)
    expect(events).toHaveLength(33)
  })

  it('has one hook input schema per event, naming that event', () => {
    for (const event of events) {
      const fact = byId.get(`claude-code.hook-input.${kebab(event)}`)
      expect(fact, event).toBeDefined()
      const name = schemaOf(fact as Fact).properties.hook_event_name
      expect(name.const ?? name.enum?.[0], event).toBe(event)
      expect(schemaOf(fact as Fact).required, event).toEqual(
        expect.arrayContaining(['session_id', 'transcript_path', 'cwd']),
      )
    }
  })

  it('records the converter and the upstream version on every fact', () => {
    for (const fact of converted.facts) {
      expect(fact.source).toMatchObject({
        kind: 'converted',
        converter: 'packages/platform-facts/scripts/convert-claude-code.ts',
        upstream: '0.3.308',
      })
      expect((fact.source as { from: string }).from).toMatch(/^@anthropic-ai\/claude-agent-sdk\/sdk(-tools)?\.d\.ts$/)
    }
  })

  it('converts permission modes, settings, hook output and tool inputs', () => {
    expect(valueOf(byId.get('claude-code.permission-modes') as Fact)).toEqual([
      'default',
      'acceptEdits',
      'bypassPermissions',
      'plan',
      'dontAsk',
      'auto',
    ])
    expect(Object.keys(schemaOf(byId.get('claude-code.settings') as Fact).properties)).toEqual(
      expect.arrayContaining(['permissions', 'hooks', 'env']),
    )
    expect(Object.keys(schemaOf(byId.get('claude-code.hook-output.sync') as Fact).properties)).toEqual(
      expect.arrayContaining(['continue', 'decision', 'hookSpecificOutput']),
    )
    expect(Object.keys(schemaOf(byId.get('claude-code.tool-input.bash') as Fact).properties)).toContain('command')
  })

  it('holds valid 2020-12 schemas and no declaration text', async () => {
    for (const fact of converted.facts) {
      if ('schema' in fact.content) expect(validateSchemaDocument(fact.content.schema), fact.id).toEqual([])
    }
    const raw = await readFile(join(root, 'facts', 'claude-code', 'converted.json'), 'utf8')
    expect(raw).not.toMatch(/export declare|declare type|import type/)
  })

  it('is sorted by id', () => {
    const ids = converted.facts.map((f) => f.id)
    expect(ids).toEqual([...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)))
  })

  it('gives the same file when run again', { timeout: 120_000 }, async () => {
    const file = join(root, 'facts', 'claude-code', 'converted.json')
    const before = await readFile(file, 'utf8')
    await promisify(execFile)(process.execPath, [join(root, 'scripts', 'convert-claude-code.ts')])
    expect(await readFile(file, 'utf8')).toBe(before)
  })
})

describe('github and pnpm conversions', async () => {
  const github = await read('github')
  const pnpm = await read('pnpm')

  it('converts the workflow schema and the REST endpoint the observed facts use', () => {
    const ids = github.facts.map((f) => f.id)
    expect(ids).toEqual(['github.rest.repos-update', 'github.workflow-syntax'])
    const workflow = schemaOf(github.facts.find((f) => f.id === 'github.workflow-syntax') as Fact)
    expect(Object.keys(workflow.properties)).toEqual(
      expect.arrayContaining(['on', 'jobs', 'permissions', 'concurrency']),
    )
    const update = schemaOf(github.facts.find((f) => f.id === 'github.rest.repos-update') as Fact)
    expect(Object.keys(update.properties.body.properties)).toEqual(
      expect.arrayContaining(['squash_merge_commit_title', 'squash_merge_commit_message']),
    )
    expect(update.required).toContain('path')
  })

  it('converts the pnpm-workspace.yaml fields', () => {
    expect(pnpm.facts.map((f) => f.id)).toEqual(['pnpm.workspace-yaml'])
    expect(Object.keys(schemaOf(pnpm.facts[0] as Fact).properties)).toEqual(
      expect.arrayContaining(['packages', 'catalog', 'onlyBuiltDependencies']),
    )
  })

  it('records origin, pinned commit and license on every fact', () => {
    for (const fact of [...github.facts, ...pnpm.facts]) {
      expect(fact.source).toMatchObject({ kind: 'converted', upstream: expect.stringMatching(/^[0-9a-f]{40}$/) })
      const description = (fact.description as { en: string }).en
      expect(description, fact.id).toMatch(/Apache-2\.0|MIT/)
      expect(validateSchemaDocument(schemaOf(fact)), fact.id).toEqual([])
    }
  })
})

describe('normalizeSchema', () => {
  it('moves draft-07 and OpenAPI 3.0 forms to 2020-12 without touching property names', () => {
    const out = normalizeSchema(
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'https://example.com/x.json',
        definitions: { a: { type: 'string', nullable: true } },
        properties: {
          items: { $ref: '#/definitions/a' },
          deprecated: { type: 'string' },
          pair: { items: [{ type: 'string' }, { type: 'number' }], additionalItems: false, deprecated: 'use y' },
          id: { type: 'string', 'x-vendor': 1 },
        },
        dependencies: { items: ['deprecated'] },
      } as never,
      {},
    ) as any
    expect(out.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
    expect(out.$id).toBeUndefined()
    expect(out.$defs.a.type).toEqual(['string', 'null'])
    expect(out.properties.items.$ref).toBe('#/$defs/a')
    expect(out.properties.deprecated).toEqual({ type: 'string' })
    expect(out.properties.pair).toMatchObject({
      prefixItems: [{ type: 'string' }, { type: 'number' }],
      items: false,
      deprecated: true,
    })
    expect(out.properties.pair.description).toBe('Deprecated: use y')
    expect(out.properties.id).toEqual({ type: 'string' })
    expect(out.dependentRequired).toEqual({ items: ['deprecated'] })
  })
})
