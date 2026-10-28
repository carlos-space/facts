// Converts the committed JSON Schemas of openai/codex (Apache-2.0) into facts/codex/converted.json:
// - hook event names, from the keys of `definitions.HooksToml.properties` in codex-rs/core/config.schema.json
// - config.toml fields, from the same file
// - hook inputs and outputs, from codex-rs/hooks/schema/generated/*.command.{input,output}.schema.json
// Usage: node scripts/convert-codex.ts
// The files are read as text at the pinned tag commit, never executed or built. Upstream `description` text is
// not copied into the output.
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeSchema, readPinned, sourceUrl, stableJson, writeFormatted } from 'fact-kit'
import type { Fact, JsonSchema, PinnedSource } from 'fact-kit'

const root = fileURLToPath(new URL('..', import.meta.url))
const cacheDir = join(root, '..', '..', '..', 'tmp', 'sources')
const CONVERTER = 'packages/ai-agent-facts/codex/scripts/convert-codex.ts'

export const CODEX_VERSION = '0.164.0'
export const CODEX_TAG = `rust-v${CODEX_VERSION}`
/** Commit the annotated tag `rust-v0.164.0` points at. */
export const CODEX_COMMIT = '6aaac694803004a63c6f393d153c96d22521a6b9'
const UPSTREAM = `${CODEX_TAG} (${CODEX_COMMIT})`

const pin = (path: string, sha256: string): PinnedSource => ({
  repo: 'openai/codex',
  commit: CODEX_COMMIT,
  path,
  sha256,
  license: 'Apache-2.0',
})

export const CONFIG_SCHEMA = pin(
  'codex-rs/core/config.schema.json',
  'ea611ee3f12a6df314b3e49585015ec6e2ebc7c3f072ccbf63c21306a4cdb5dc',
)

const HOOK_DIR = 'codex-rs/hooks/schema/generated'
/** The generated hook schemas, by file name stem and direction. Update the list and the hashes when the tag changes. */
export const HOOK_SCHEMAS: { name: string; direction: 'input' | 'output'; sha256: string }[] = [
  ['interrupt', 'input', 'be37402db3524543efe1e4058e6b9a3a53f7dd8f7791a9b75bb2accf7842196e'],
  ['interrupt', 'output', 'd9a3fe9ed8ffd9e920d8bf1e49d2c1af49cf63b0c3cf526e568511dc998f824a'],
  ['model-request', 'input', 'f60683388becc6c50fd64999a83254f9f09b4c6e35548c4565004d9c54d44a38'],
  ['permission-request', 'input', '75c73d7a38cfc0e73ef06bd1fc506a44d25874522069ec4fb85e0bf1e7d6b8fb'],
  ['permission-request', 'output', '749c73245b4b6d43537c3049f76720ab1c2bd48d7e4752b744b376925b9d57a1'],
  ['post-compact', 'input', '4a4b3f3022c939a15ab12e95f5c5c17b18bb20f74fe962ae0a51b2a3e76e63f9'],
  ['post-compact', 'output', '48355bfcb568259cf396beb6ade2ac32827f50bf6a3c20b395c337dce184cbed'],
  ['post-tool-use', 'input', '8ea1e4bccb262fad05b85c300d562d2653c5a64118d6a2c5704468fc4ea836a9'],
  ['post-tool-use', 'output', 'a823d0e2c941e98d7d3af825dfdb0b1dfa6a935696ff8b8529e8e83232a1b0c8'],
  ['pre-compact', 'input', '065f0ae3cd628ac9af8c0cf9bd1d5a673bcbd5ea1d7dcdc0c6437f34dd0189d9'],
  ['pre-compact', 'output', 'c392f3054ae6750f427d4dec07380fd67e8c58a7939a35d5c69bfa070c7ca032'],
  ['pre-tool-use', 'input', 'fabed428f0fe75767c5700208b166da5faef4e031d601dfc8bff2f96d340c682'],
  ['pre-tool-use', 'output', 'e684f81c63fbb5972892f6a848b49fec68c8ce137931651093d2dd1da56a1dd6'],
  ['session-end', 'input', '23b1b69f92fa8ac29f8319478984b5aa5aaf09e5ca355ce90aa010452937e41c'],
  ['session-start', 'input', '54168cf0bb3641bbc55dcdc58aa3803651d4f24499339061f3e9bb0ef9095633'],
  ['session-start', 'output', 'f375e6de1c59ecbabd8c1aff05a67976d0f3aa2ef061808838de4c7c20be1c71'],
  ['stop', 'input', '7db4793c404b5c46b230c27b9507eb1a558fd958689d8715221c5dd81351a06a'],
  ['stop', 'output', 'dc2b30e84c97beca5825aa64ca46e1337e402781dc5a9142b67111d10523f15c'],
  ['subagent-start', 'input', 'ce7dc9b5ae8826d1e0c59ffcea793e558aebceb7917a2eb9bb2edd8a7ac37aa9'],
  ['subagent-start', 'output', '34e8ec95393d2aa930d7932a34c3fb29a5e5f90c264fdbcc581393c5838b4660'],
  ['subagent-stop', 'input', '94dc8df29f4691195ac2338ae6de876230e5100a10b94ef48df4e732424b5df5'],
  ['subagent-stop', 'output', '8ba2cd7899ae4544193764e67e988235edebe984abe5788634d123bbf13e3e3a'],
  ['user-prompt-submit', 'input', 'e6b923bc519896197c44c4fc267a9d115cef24ac418dde9c27db699f4e3b65fd'],
  ['user-prompt-submit', 'output', '5e290303db710f3ccc12f4a2744e8586e7749b3ca2b6bf9f57781ed75bf17b2b'],
].map(([name, direction, sha256]) => ({ name, direction, sha256 }) as (typeof HOOK_SCHEMAS)[number])

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => v !== null && typeof v === 'object' && !Array.isArray(v)

// Keywords whose value maps a name to a subschema. A key named `description` inside one is a field, not text.
const NAME_MAPS = new Set(['properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas'])

/**
 * Removes the upstream `description` text at every depth. The facts carry shapes only.
 * TODO: once fact-kit has an option to convert without description text, use it and delete this function.
 */
export function stripDescriptions(value: unknown, inNameMap = false): unknown {
  if (Array.isArray(value)) return value.map((v) => stripDescriptions(v))
  if (!isObj(value)) return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => inNameMap || key !== 'description')
      .map(([key, v]) => [key, stripDescriptions(v, !inNameMap && NAME_MAPS.has(key))]),
  )
}

const notes = new Map<string, number>()
const toSchema = (text: string): JsonSchema =>
  normalizeSchema(stripDescriptions(JSON.parse(text)) as JsonSchema, { notes })

const source = (pinned: PinnedSource): Fact['source'] => ({
  kind: 'converted',
  from: sourceUrl(pinned),
  converter: CONVERTER,
  upstream: UPSTREAM,
})
const text = (en: string) => ({ en })

async function main(): Promise<void> {
  const config = JSON.parse(await readPinned(CONFIG_SCHEMA, { cacheDir })) as {
    properties: Record<string, unknown>
    definitions: Record<string, { properties?: Record<string, { type?: string; items?: { $ref?: string } }> }>
  }
  const hooksToml = config.definitions.HooksToml?.properties
  if (!hooksToml) throw new Error('definitions.HooksToml.properties was not found')
  // `state` and any other non-array key is not an event. Events are lists of matcher groups.
  const events = Object.entries(hooksToml)
    .filter(([, p]) => p.type === 'array' && p.items?.$ref === '#/definitions/MatcherGroup')
    .map(([name]) => name)
  if (events.length === 0) throw new Error('no hook events found')

  const facts: Fact[] = []
  facts.push({
    id: 'codex.hook-events',
    tool: 'codex',
    topics: ['hook'],
    title: text('Hook event names'),
    description: text('Keys of the [hooks] table in config.toml that hold a list of matcher groups.'),
    content: { value: events },
    source: source(CONFIG_SCHEMA),
  })
  facts.push({
    id: 'codex.config',
    tool: 'codex',
    topics: ['config'],
    title: text('config.toml fields'),
    content: { schema: toSchema(await readPinned(CONFIG_SCHEMA, { cacheDir })) },
    source: source(CONFIG_SCHEMA),
  })
  for (const { name, direction, sha256 } of HOOK_SCHEMAS) {
    const pinned = pin(`${HOOK_DIR}/${name}.command.${direction}.schema.json`, sha256)
    facts.push({
      id: `codex.hook-${direction}.${name}`,
      tool: 'codex',
      topics: ['hook', name],
      title: text(`${name} hook ${direction}`),
      content: { schema: toSchema(await readPinned(pinned, { cacheDir })) },
      source: source(pinned),
    })
  }

  facts.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const output = { describes: { codex: CODEX_VERSION }, facts }
  await writeFormatted(join(root, 'facts', 'codex', 'converted.json'), `${stableJson(output)}\n`)
  const inputs = HOOK_SCHEMAS.filter((s) => s.direction === 'input').length
  console.log(
    `converted ${facts.length} facts from ${UPSTREAM}: ${events.length} hook events, ` +
      `${inputs} hook inputs, ${HOOK_SCHEMAS.length - inputs} hook outputs, ` +
      `${Object.keys(config.properties).length} top-level config fields`,
  )
  for (const [note, count] of [...notes].sort()) console.log(`  ${note}: ${count}`)
}

await main()
