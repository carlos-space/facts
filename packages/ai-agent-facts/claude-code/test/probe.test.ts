// Tests of the hook probe that need no API call: the event table, the plans and the comparison.
import { describe, expect, it } from 'vitest'
import { buildReport, compareCaptures, hookInputId, readConverted } from '../probes/claude-code-hooks/compare.ts'
import type { Capture } from '../probes/claude-code-hooks/compare.ts'
import { claudeArgs } from '../probes/claude-code-hooks/driver.ts'
import { EVENT_TABLE, checkEventTable } from '../probes/claude-code-hooks/event-table.ts'
import { hookSettings } from '../probes/claude-code-hooks/fixture.ts'
import { buildPlans } from '../probes/claude-code-hooks/plans.ts'

const converted = await readConverted()
const events = converted.facts.find((f) => f.id === 'claude-code.hook-events')?.content.value as string[]

describe('event table', () => {
  it('matches HOOK_EVENTS of the converted facts', () => {
    expect(events).toHaveLength(33)
    expect(checkEventTable(events)).toEqual([])
  })

  it('reports an event the table lacks or has extra', () => {
    expect(checkEventTable(events.slice(1))).toHaveLength(1)
    expect(checkEventTable([...events, 'NewEvent'])).toEqual(['HOOK_EVENTS has NewEvent, which the table lacks'])
  })

  it('gives a reason for exactly the events no run fires', () => {
    const unreachable = Object.entries(EVENT_TABLE).filter(([, e]) => e.run === null)
    expect(unreachable.map(([name]) => name).sort()).toEqual(['TeammateIdle', 'WorktreeRemove'])
    for (const [, entry] of unreachable) expect(entry.unreachable).toBeTruthy()
  })

  it('has a hook input schema in the converted facts for every event', () => {
    const ids = new Set(converted.facts.map((f) => f.id))
    for (const event of events) expect(ids.has(hookInputId(event)), event).toBe(true)
  })
})

describe('plans', () => {
  const plans = buildPlans('haiku')

  it('stay within eight claude -p runs, and every reachable event has a run', () => {
    expect(plans.length).toBeLessThanOrEqual(8)
    const names = new Set(plans.map((p) => p.name))
    for (const [event, entry] of Object.entries(EVENT_TABLE)) {
      if (entry.run !== null) expect(names.has(entry.run), event).toBe(true)
    }
  })

  it('run with project settings only and no session files', () => {
    const args = claudeArgs(plans[0] as (typeof plans)[number], (t) => t, 1)
    expect(args).toEqual(
      expect.arrayContaining(['--setting-sources', 'project', '--no-session-persistence', '--model', 'haiku']),
    )
    expect(args[args.indexOf('--setting-sources') + 1]).toBe('project')
  })

  it('keep the session on disk only for the run that needs task tools', () => {
    const persisting = plans.filter((plan) => !claudeArgs(plan, (t) => t, 1).includes('--no-session-persistence'))
    expect(persisting.map((plan) => plan.name)).toEqual(['tasks'])
  })

  it('hook settings cover every event', () => {
    const settings = hookSettings(events) as { hooks: Record<string, unknown[]> }
    expect(Object.keys(settings.hooks).sort()).toEqual([...events].sort())
  })
})

describe('comparison', () => {
  const base = {
    session_id: 's',
    transcript_path: 't',
    cwd: '/x',
    hook_event_name: 'Stop',
    stop_hook_active: false,
    last_assistant_message: 'hi',
  }
  const capture = (input: unknown, event = 'Stop'): Capture => ({ run: 'main', file: `${event}-1.json`, event, input })
  const stop = (captures: Capture[]) => compareCaptures(converted, ['Stop'], captures)[0]

  it('finds nothing wrong with an input that fits', () => {
    expect(stop([capture(base)])).toMatchObject({ captures: 1, extra: [], missing: [], mismatched: [] })
  })

  it('reports an extra property, a missing required one and a wrong type', () => {
    expect(stop([capture({ ...base, scratchpad_dir: '/x' })])?.extra).toEqual(['scratchpad_dir'])
    const { session_id: _gone, ...without } = base
    expect(stop([capture(without)])?.missing).toEqual(['session_id'])
    expect(stop([capture({ ...base, cwd: 5 })])?.mismatched).toEqual(['cwd: must be string'])
  })

  it('lists events that did not fire with the reason', () => {
    const rows = buildReport(compareCaptures(converted, ['TeammateIdle', 'Stop', 'Setup'], [capture(base)]))
    expect(rows.map((r) => [r.event, r.status])).toEqual([
      ['TeammateIdle', 'unreachable'],
      ['Stop', 'compared'],
      ['Setup', 'not fired'],
    ])
    expect(rows[0]?.note).toMatch(/TeamCreate/)
  })
})
