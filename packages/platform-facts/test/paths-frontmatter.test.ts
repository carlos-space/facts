// Reads the built index.json of claude-code and codex and checks the path and frontmatter facts added for
// where each tool reads skills, agents, rules, settings and instructions from. The hashes are re-checked
// against the live pages by the document probe, which needs the network, so this test only checks their form.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Ajv2020 } from 'ajv/dist/2020.js'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Fact, FactIndex } from '../../fact-kit/src/index.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const kitBin = fileURLToPath(new URL('../../fact-kit/src/bin.ts', import.meta.url))

const CLAUDE_PATHS = [
  'claude-code.skill-paths',
  'claude-code.agent-paths',
  'claude-code.rule-paths',
  'claude-code.settings-paths',
  'claude-code.memory-paths',
  'claude-code.mcp-json-paths',
  'claude-code.plugin-layout',
]
const CLAUDE_SCHEMAS = [
  'claude-code.skill-frontmatter',
  'claude-code.agent-frontmatter',
  'claude-code.rule-frontmatter',
]
const CODEX_PATHS = [
  'codex.agent-paths',
  'codex.skill-paths',
  'codex.hook-paths',
  'codex.rule-paths',
  'codex.config-paths',
  'codex.agents-md-paths',
]
const CODEX_SCHEMAS = ['codex.skill-frontmatter', 'codex.agent-file']

let claude = new Map<string, Fact>()
let codex = new Map<string, Fact>()

beforeAll(() => {
  execFileSync(process.execPath, [kitBin, 'build'], { cwd: root, stdio: 'pipe' })
  const read = (entry: string) =>
    new Map(
      (JSON.parse(readFileSync(join(root, 'dist', entry, 'index.json'), 'utf8')) as FactIndex).facts.map((f) => [
        f.id,
        f,
      ]),
    )
  claude = read('claude-code')
  codex = read('codex')
}, 120_000)

const valueOf = (map: Map<string, Fact>, id: string) => {
  const content = map.get(id)?.content
  expect(content, id).toBeDefined()
  expect(content && 'value' in content, `${id} has content.value`).toBe(true)
  return (content as { value: Record<string, string[]> }).value
}
const schemaOf = (map: Map<string, Fact>, id: string) => {
  const content = map.get(id)?.content
  expect(content, id).toBeDefined()
  expect(content && 'schema' in content, `${id} has content.schema`).toBe(true)
  return (content as { schema: any }).schema
}
const validator = (schema: object) => new Ajv2020({ strict: false }).compile(schema)

describe('path facts', () => {
  it.each([
    ['claude-code', CLAUDE_PATHS],
    ['codex', CODEX_PATHS],
  ] as const)('%s: every kind has a value of one shape', (tool, ids) => {
    const map = tool === 'codex' ? codex : claude
    for (const id of ids) {
      const value = valueOf(map, id)
      expect(
        Object.keys(value).filter((k) => !['project', 'user', 'managed', 'plugin'].includes(k)),
        id,
      ).toEqual([])
      expect(Array.isArray(value.project) || Array.isArray(value.user), id).toBe(true)
      for (const list of Object.values(value)) {
        expect(Array.isArray(list), id).toBe(true)
        for (const path of list) expect(typeof path, id).toBe('string')
      }
    }
  })

  it('claude-code lists the documented locations', () => {
    expect(valueOf(claude, 'claude-code.skill-paths')).toMatchObject({
      user: ['~/.claude/skills/{name}/SKILL.md'],
      project: expect.arrayContaining(['.claude/skills/{name}/SKILL.md']),
      plugin: ['skills/{name}/SKILL.md'],
    })
    expect(valueOf(claude, 'claude-code.agent-paths').project).toEqual(['.claude/agents/{name}.md'])
    expect(valueOf(claude, 'claude-code.rule-paths').project).toEqual(['.claude/rules/**/*.md'])
    expect(valueOf(claude, 'claude-code.settings-paths').project).toEqual([
      '.claude/settings.json',
      '.claude/settings.local.json',
    ])
    expect(valueOf(claude, 'claude-code.memory-paths').user).toEqual(['~/.claude/CLAUDE.md'])
    expect(valueOf(claude, 'claude-code.mcp-json-paths').project).toEqual(['.mcp.json'])
    expect(valueOf(claude, 'claude-code.plugin-layout').plugin).toContain('.claude-plugin/plugin.json')
  })

  it('codex lists the documented locations and no .codex/AGENTS.md', () => {
    const agentsMd = valueOf(codex, 'codex.agents-md-paths')
    expect(agentsMd.user).toEqual(['~/.codex/AGENTS.override.md', '~/.codex/AGENTS.md'])
    expect(agentsMd.project).toEqual(['{dir}/AGENTS.override.md', '{dir}/AGENTS.md'])
    expect([...(agentsMd.user ?? []), ...(agentsMd.project ?? [])]).not.toContain('.codex/AGENTS.md')
    expect(valueOf(codex, 'codex.agent-paths')).toEqual({
      user: ['~/.codex/agents/{name}.toml'],
      project: ['.codex/agents/{name}.toml'],
    })
    expect(valueOf(codex, 'codex.skill-paths').user).toEqual(['$HOME/.agents/skills/{name}/SKILL.md'])
    expect(valueOf(codex, 'codex.hook-paths').user).toContain('~/.codex/hooks.json')
    expect(valueOf(codex, 'codex.rule-paths').user).toContain('~/.codex/rules/default.rules')
    expect(valueOf(codex, 'codex.config-paths').user).toEqual(['~/.codex/config.toml'])
  })
})

describe('claude-code frontmatter schemas', () => {
  it('skill: 20 optional fields with the documented values', () => {
    const schema = schemaOf(claude, 'claude-code.skill-frontmatter')
    expect(schema.type).toBe('object')
    expect(Object.keys(schema.properties)).toHaveLength(20)
    expect(schema.required).toBeUndefined()
    expect(schema.properties.effort.enum).toEqual(['low', 'medium', 'high', 'xhigh', 'max'])
    expect(schema.properties.shell.enum).toEqual(['bash', 'powershell'])
    expect(schema.properties.context.enum).toEqual(['fork'])
    expect(schema.properties.compatibility.maxLength).toBe(500)
    const ok = validator(schema)
    expect(ok({ name: 'x', 'allowed-tools': 'Read, Grep', effort: 'high', 'disable-model-invocation': true })).toBe(
      true,
    )
    expect(ok({ effort: 'huge' })).toBe(false)
    expect(ok({ shell: 'zsh' })).toBe(false)
  })

  it('agent: name and description required, no SDK-only prompt', () => {
    const schema = schemaOf(claude, 'claude-code.agent-frontmatter')
    expect(schema.required).toEqual(['name', 'description'])
    expect(Object.keys(schema.properties)).toHaveLength(19)
    expect(schema.properties).not.toHaveProperty('prompt')
    expect(schema.properties.memory.enum).toEqual(['user', 'project', 'local'])
    expect(schema.properties.isolation.enum).toEqual(['worktree'])
    expect(schema.properties.color.enum).toHaveLength(8)
    expect(schema.properties.autoCompactWindow).toMatchObject({ minimum: 100000, maximum: 1000000 })
    const ok = validator(schema)
    expect(ok({ name: 'reviewer', description: 'Reviews code', tools: ['Read'], color: 'blue' })).toBe(true)
    expect(ok({ name: 'reviewer' })).toBe(false)
    expect(ok({ name: 'a:b', description: 'd' })).toBe(false)
    expect(ok({ name: 'r', description: 'd', color: 'black' })).toBe(false)
  })

  it('rule: only paths', () => {
    const schema = schemaOf(claude, 'claude-code.rule-frontmatter')
    expect(Object.keys(schema.properties)).toEqual(['paths'])
    const ok = validator(schema)
    expect(ok({ paths: ['src/**/*.ts'] })).toBe(true)
    expect(ok({ paths: 'src/**/*.ts, test/**' })).toBe(true)
    expect(ok({ paths: 3 })).toBe(false)
  })
})

describe('codex frontmatter and agent file schemas', () => {
  it('skill: only description is required, name is at most 64 characters', () => {
    const schema = schemaOf(codex, 'codex.skill-frontmatter')
    expect(schema.required).toEqual(['description'])
    expect(schema.properties.name.maxLength).toBe(64)
    expect(schema.properties.metadata.properties).toHaveProperty('short-description')
    const ok = validator(schema)
    expect(ok({ description: 'does a thing' })).toBe(true)
    expect(ok({ name: 'x', description: 'd', metadata: { 'short-description': 's' } })).toBe(true)
    expect(ok({ name: 'x' })).toBe(false)
    expect(ok({ name: 'x'.repeat(65), description: 'd' })).toBe(false)
  })

  it('agent file: name, description and developer_instructions required, other keys allowed', () => {
    const schema = schemaOf(codex, 'codex.agent-file')
    expect(schema.required).toEqual(['name', 'description', 'developer_instructions'])
    expect(Object.keys(schema.properties).sort()).toEqual([
      'description',
      'developer_instructions',
      'name',
      'nickname_candidates',
    ])
    expect(schema.additionalProperties).toBeUndefined()
    expect(schema.description).toContain('codex.config')
    const ok = validator(schema)
    expect(
      ok({ name: 'r', description: 'd', developer_instructions: 'do it', model: 'gpt-5', nickname_candidates: ['a'] }),
    ).toBe(true)
    expect(ok({ name: 'r', description: 'd' })).toBe(false)
  })
})

describe('observed sources', () => {
  it('every new fact is an observed doc with a hash probe whose anchor has no angle brackets', () => {
    const facts = [...CLAUDE_PATHS, ...CLAUDE_SCHEMAS]
      .map((id) => claude.get(id)!)
      .concat([...CODEX_PATHS, ...CODEX_SCHEMAS].map((id) => codex.get(id)!))
    expect(facts).toHaveLength(18)
    for (const fact of facts) {
      expect(fact, 'fact exists').toBeDefined()
      expect(fact.source).toMatchObject({ kind: 'observed', basis: 'doc' })
      const probe = fact.verify?.probe
      expect(probe?.kind, fact.id).toBe('hash')
      if (probe?.kind !== 'hash') continue
      expect(probe.hash, fact.id).toMatch(/^sha256:[0-9a-f]{16}$/)
      expect(probe.anchor, fact.id).not.toMatch(/[<>]/)
      expect(probe.anchor.length, fact.id).toBeGreaterThan(10)
    }
    expect(claude.get('claude-code.skill-paths')?.verify?.verifiedOn).toMatch(/^\d+\.\d+\.\d+$/)
    expect(codex.get('codex.skill-paths')?.verify?.verifiedOn).toBe('2026-10-24')
  })
})
