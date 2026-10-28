import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { HOOK_EVENTS } from '@anthropic-ai/claude-agent-sdk'
import { describe, expect, it } from 'vitest'
import { validateSchemaDocument } from 'fact-kit'
import type { Fact } from 'fact-kit'

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
  const events: readonly string[] = HOOK_EVENTS

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
        converter: 'packages/ai-agent-facts/claude-code/scripts/convert-claude-code.ts',
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

  // The converter writes to a directory under the repository's tmp/ (so prettier finds the repository's settings),
  // and the test compares that file with the committed one. `converted.json` itself is never rewritten.
  it('gives the same file when run again', { timeout: 120_000 }, async () => {
    const scratchRoot = join(root, '..', '..', '..', 'tmp')
    await mkdir(scratchRoot, { recursive: true })
    const dir = await mkdtemp(join(scratchRoot, 'converted-rerun-'))
    try {
      const out = join(dir, 'converted.json')
      await promisify(execFile)(process.execPath, [join(root, 'scripts', 'convert-claude-code.ts'), '--out', out])
      const committed = await readFile(join(root, 'facts', 'claude-code', 'converted.json'), 'utf8')
      expect(await readFile(out, 'utf8')).toBe(committed)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })
})
