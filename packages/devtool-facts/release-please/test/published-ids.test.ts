// Fails when a fact id that has shipped disappears from the source. A downstream hub reads facts by id
// (readFacts throws on an unknown id), so a missing id breaks the consumer's build, and regenerating a
// facts file (convert, migrate) can drop entries without any other test noticing.
//
// published-ids.json holds the ids per entry as of the baseline version. To remove a fact on purpose, add its
// id to "removed" in the same change. A new fact needs no edit here. After a release, regenerate "ids" from
// the released dist/<entry>/index.json files and keep the ids in "removed" out of it.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadEntries } from 'fact-kit'

const root = fileURLToPath(new URL('..', import.meta.url))
const published = JSON.parse(await readFile(join(root, 'test', 'published-ids.json'), 'utf8')) as {
  baseline: string
  removed: string[]
  ids: Record<string, string[]>
}
const entries = await loadEntries(join(root, 'facts'))
const current = new Map(entries.map((e) => [e.entry, new Set(e.module.facts.map((f) => f.id))]))

describe(`fact ids published in ${published.baseline}`, () => {
  it('records at least one id per entry', () => {
    expect(Object.keys(published.ids).length).toBeGreaterThan(0)
  })

  it('has no id that disappeared without being listed in "removed"', () => {
    const removed = new Set(published.removed)
    const missing = Object.entries(published.ids).flatMap(([entry, ids]) =>
      ids.filter((id) => !removed.has(id) && !current.get(entry)?.has(id)).map((id) => `${entry}: ${id}`),
    )
    expect(missing).toEqual([])
  })

  it('does not list a removed id that is still present', () => {
    const all = new Set([...current.values()].flatMap((s) => [...s]))
    expect(published.removed.filter((id) => all.has(id))).toEqual([])
  })
})
