// Converts the type declarations of @anthropic-ai/claude-agent-sdk into facts under facts/claude-code/converted.json.
// Usage: node scripts/convert-claude-code.ts
// The SDK is pinned in package.json, and its `claudeCodeVersion` is the Claude Code version the facts describe.
// The SDK's license is Anthropic's proprietary terms, so the declaration files are only read here. The output
// holds names, types and enum values only. `descriptions: false` removes the SDK's JSDoc text, which is its prose.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { interfaceToJsonSchema, readStringTuplesFromFile } from 'fact-kit'
import type { Fact, JsonSchema } from 'fact-kit'
import { stableJson, writeFormatted } from '../../../../scripts/lib/format.ts'
import { normalizeSchema } from '../../../../scripts/lib/schema.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = join(root, '..', '..', '..')
const sdkDir = join(root, 'node_modules', '@anthropic-ai', 'claude-agent-sdk')
const SDK_NAME = '@anthropic-ai/claude-agent-sdk'
const CONVERTER = 'packages/ai-agent-facts/claude-code/scripts/convert-claude-code.ts'

const kebab = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

/** Hoists `$defs[X]` to the top when the generator returned only a `$ref` to it (type aliases do). */
export function inlineRoot(schema: JsonSchema): JsonSchema {
  if (typeof schema === 'boolean') return schema
  const ref = typeof schema.$ref === 'string' ? /^#\/\$defs\/(.+)$/.exec(schema.$ref)?.[1] : undefined
  const defs = schema.$defs as Record<string, Record<string, unknown>> | undefined
  const target = ref ? defs?.[ref] : undefined
  if (!ref || !defs || !target) return schema
  const { [ref]: _hoisted, ...rest } = defs
  const { $ref: _ref, $defs: _defs, ...top } = schema
  const out: Record<string, unknown> = { ...top, ...target }
  if (Object.keys(rest).length > 0) out.$defs = rest
  return out
}

interface Source {
  /** File the type is declared in, relative to the SDK package. */
  file: 'sdk.d.ts' | 'sdk-tools.d.ts'
  type: string
}

async function schemaOf(source: Source, scratch: string): Promise<JsonSchema> {
  const path = join(sdkDir, source.file)
  // A type named like a Node global (`Settings`, from http2) must be reached through an alias, or the generator picks the Node one.
  const wrapper = join(scratch, `${source.type}.d.ts`)
  await writeFile(wrapper, `import type { ${source.type} as T } from '${path}'\nexport type Root = T\n`)
  return normalizeSchema(inlineRoot(await interfaceToJsonSchema({ path: wrapper, type: 'Root', descriptions: false })))
}

const text = (en: string) => ({ en })

async function main(): Promise<void> {
  const pkg = JSON.parse(await readFile(join(sdkDir, 'package.json'), 'utf8')) as {
    version: string
    claudeCodeVersion: string
  }
  const sdkText = await readFile(join(sdkDir, 'sdk.d.ts'), 'utf8')
  const toolsText = await readFile(join(sdkDir, 'sdk-tools.d.ts'), 'utf8')
  const scratch = join(repoRoot, 'tmp', 'convert-claude-code')
  await mkdir(scratch, { recursive: true })

  const tuples = await readStringTuplesFromFile(join(sdkDir, 'sdk.d.ts'))
  const events = tuples.HOOK_EVENTS
  if (!events || events.length === 0) throw new Error('HOOK_EVENTS was not found in sdk.d.ts')
  const declared = (re: RegExp, haystack: string) => new Set([...haystack.matchAll(re)].map((m) => m[1] as string))
  const specificOutputs = declared(/^export declare type (\w+)HookSpecificOutput\b/gm, sdkText)
  const toolInputs = [...declared(/^export interface (\w+)Input\b/gm, toolsText)].sort()

  const source = (file: Source['file']): Fact['source'] => ({
    kind: 'converted',
    from: `${SDK_NAME}/${file}`,
    converter: CONVERTER,
    upstream: pkg.version,
  })
  const facts: Fact[] = []
  const add = (fact: Omit<Fact, 'tool' | 'source'> & { file: Source['file'] }) => {
    const { file, ...rest } = fact
    facts.push({ ...rest, tool: 'claude-code', source: source(file) })
  }
  const list = (id: string, title: string, topics: string[], values: readonly string[]) =>
    add({ id: `claude-code.${id}`, topics, title: text(title), content: { value: values }, file: 'sdk.d.ts' })

  list('hook-events', 'Hook event names', ['hook'], events)
  if (tuples.EXIT_REASONS) list('exit-reasons', 'Session end reasons', ['hook', 'session'], tuples.EXIT_REASONS)
  if (tuples.BUILTIN_TOOL_NAMES) list('builtin-tool-names', 'Built-in tool names', ['tool'], tuples.BUILTIN_TOOL_NAMES)

  const permissionMode = (await schemaOf({ file: 'sdk.d.ts', type: 'PermissionMode' }, scratch)) as {
    enum?: string[]
    description?: string
  }
  if (!permissionMode.enum) throw new Error('PermissionMode is not a string union')
  add({
    id: 'claude-code.permission-modes',
    topics: ['permission'],
    title: text('Permission modes'),
    ...(permissionMode.description ? { description: text(permissionMode.description) } : {}),
    content: { value: permissionMode.enum },
    file: 'sdk.d.ts',
  })

  add({
    id: 'claude-code.hook-input.base',
    topics: ['hook'],
    title: text('Fields every hook input has'),
    content: { schema: await schemaOf({ file: 'sdk.d.ts', type: 'BaseHookInput' }, scratch) },
    file: 'sdk.d.ts',
  })
  for (const event of events) {
    add({
      id: `claude-code.hook-input.${kebab(event)}`,
      topics: ['hook', event],
      title: text(`${event} hook input`),
      content: { schema: await schemaOf({ file: 'sdk.d.ts', type: `${event}HookInput` }, scratch) },
      file: 'sdk.d.ts',
    })
    if (specificOutputs.has(event)) {
      add({
        id: `claude-code.hook-specific-output.${kebab(event)}`,
        topics: ['hook', event],
        title: text(`${event} hook specific output`),
        content: { schema: await schemaOf({ file: 'sdk.d.ts', type: `${event}HookSpecificOutput` }, scratch) },
        file: 'sdk.d.ts',
      })
    }
  }
  add({
    id: 'claude-code.hook-output.sync',
    topics: ['hook'],
    title: text('Hook JSON output'),
    content: { schema: await schemaOf({ file: 'sdk.d.ts', type: 'SyncHookJSONOutput' }, scratch) },
    file: 'sdk.d.ts',
  })
  add({
    id: 'claude-code.hook-output.async',
    topics: ['hook'],
    title: text('Hook JSON output of an async hook'),
    content: { schema: await schemaOf({ file: 'sdk.d.ts', type: 'AsyncHookJSONOutput' }, scratch) },
    file: 'sdk.d.ts',
  })
  add({
    id: 'claude-code.settings',
    topics: ['settings'],
    title: text('settings.json fields'),
    content: { schema: await schemaOf({ file: 'sdk.d.ts', type: 'Settings' }, scratch) },
    file: 'sdk.d.ts',
  })
  for (const name of toolInputs) {
    add({
      id: `claude-code.tool-input.${kebab(name)}`,
      topics: ['tool', name],
      title: text(`${name} tool input`),
      content: { schema: await schemaOf({ file: 'sdk-tools.d.ts', type: `${name}Input` }, scratch) },
      file: 'sdk-tools.d.ts',
    })
  }

  facts.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const output = {
    sdk: { name: SDK_NAME, version: pkg.version },
    describes: { 'claude-code': pkg.claudeCodeVersion },
    facts,
  }
  await writeFormatted(join(root, 'facts', 'claude-code', 'converted.json'), `${stableJson(output)}\n`)
  console.log(
    `converted ${facts.length} facts from ${SDK_NAME}@${pkg.version} (Claude Code ${pkg.claudeCodeVersion}): ` +
      `${events.length} hook events, ${toolInputs.length} tool inputs`,
  )
}

await main()
