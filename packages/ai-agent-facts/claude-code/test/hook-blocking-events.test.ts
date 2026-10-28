import { describe, expect, it } from 'vitest'
import type { Fact } from 'fact-kit'
import converted from '../facts/claude-code/converted.json' with { type: 'json' }
import { blocking } from '../facts/claude-code/hook.ts'

describe('claude-code.hook-blocking-events', () => {
  const events = (
    (converted.facts as Fact[]).find((f) => f.id === 'claude-code.hook-events')?.content as { value: string[] }
  ).value

  it('only names events that claude-code.hook-events lists', () => {
    expect(blocking.filter((name) => !events.includes(name))).toEqual([])
  })

  it('names each event once', () => {
    expect(new Set(blocking).size).toBe(blocking.length)
  })
})
