// Compares the workspace's five tables with the built dist/<platform>/index.json, id by id and column by column.
// Usage: node scripts/compare-migration.ts [--workspace <dir>] [--dist <dir>]
// Exit code 0 when every row matches, 1 otherwise. Run `pnpm build` first.
import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { compareMigration, defaultWorkspace, factsById, loadLegacyRows } from './lib/legacy.ts'
import type { LegacySidecar } from './lib/legacy.ts'
import type { FactIndex } from '../../fact-kit/src/index.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const { values } = parseArgs({ options: { workspace: { type: 'string' }, dist: { type: 'string' } } })
const dist = resolve(root, values.dist ?? 'dist')

const indexes: FactIndex[] = []
for (const item of await readdir(dist, { withFileTypes: true })) {
  if (!item.isDirectory()) continue
  indexes.push(JSON.parse(await readFile(join(dist, item.name, 'index.json'), 'utf8')) as FactIndex)
}
const sidecars = JSON.parse(await readFile(join(root, 'migration', 'legacy-fields.json'), 'utf8')) as Record<
  string,
  LegacySidecar
>
const rows = await loadLegacyRows(values.workspace ?? defaultWorkspace())
const result = compareMigration(rows, factsById(indexes), sidecars)

for (const d of result.differences) {
  console.log(`DIFF ${d.id} ${d.field}: expected ${JSON.stringify(d.expected)}, got ${JSON.stringify(d.actual)}`)
}
console.log(
  `${result.matched}/${result.total} 筆對上、差異 ${result.mismatched} 筆（${result.differences.length} 個欄位）`,
)
process.exitCode = result.mismatched === 0 ? 0 : 1
