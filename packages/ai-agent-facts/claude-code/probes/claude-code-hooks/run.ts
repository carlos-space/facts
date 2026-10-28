// Probe: fires Claude Code hook events with `claude -p` and compares the JSON each one sends with the JSON Schemas
// converted from the SDK. It calls the API, so it is run by hand and is not part of CI.
//
//   pnpm --filter claude-code-facts probe:hooks [--model haiku] [--only main,tasks] [--out dir]
//                                                          [--max-claude-runs 8] [--compare-only dir] [--dry-run]
//
// Output goes to tmp/ (default tmp/<date>-hook-probe/<time>/): project/, captures/<run>/, runs/<run>.jsonl,
// report.json and report.txt.
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { buildReport, compareCaptures, formatReport, readCaptures, readConverted } from './compare.ts'
import { runSession, claudeArgs } from './driver.ts'
import type { RunOutcome } from './driver.ts'
import { checkEventTable } from './event-table.ts'
import { createFixture } from './fixture.ts'
import { buildPlans } from './plans.ts'

const repoRoot = fileURLToPath(new URL('../../../../..', import.meta.url))
const { values } = parseArgs({
  options: {
    model: { type: 'string', default: 'haiku' },
    only: { type: 'string' },
    out: { type: 'string' },
    'max-claude-runs': { type: 'string', default: '8' },
    'compare-only': { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
})

const converted = await readConverted()
const events = converted.facts.find((f) => f.id === 'claude-code.hook-events')?.content.value as string[] | undefined
if (!events) throw new Error('claude-code.hook-events is missing from facts/claude-code/converted.json')

const mismatches = checkEventTable(events)
if (mismatches.length > 0) {
  console.error(`The event table disagrees with HOOK_EVENTS:\n${mismatches.map((m) => `  ${m}`).join('\n')}`)
  process.exit(1)
}
console.log(
  `HOOK_EVENTS (${events.length}) matches the event table. Claude Code ${converted.describes?.['claude-code']}.`,
)

async function report(outDir: string, capturesRoot: string, outcomes: RunOutcome[]): Promise<void> {
  const rows = buildReport(compareCaptures(converted, events as string[], await readCaptures(capturesRoot)))
  const text = formatReport(rows)
  await writeFile(join(outDir, 'report.json'), `${JSON.stringify({ outcomes, rows }, null, 2)}\n`)
  await writeFile(join(outDir, 'report.txt'), `${text}\n`)
  console.log(`\n${text}`)
  console.log(`\nreport: ${join(outDir, 'report.txt')}`)
}

if (values['compare-only']) {
  const dir = resolve(values['compare-only'])
  await report(dir, join(dir, 'captures'), [])
  process.exit(0)
}

const pad = (n: number) => String(n).padStart(2, '0')
const now = new Date()
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
const outDir = resolve(values.out ?? join(repoRoot, 'tmp', `${stamp.slice(0, 10)}-hook-probe`, stamp.slice(11)))
const only = values.only?.split(',')
const plans = buildPlans(values.model as string).filter((p) => !only || only.includes(p.name))
const limit = Number(values['max-claude-runs'])
if (plans.length > limit) {
  console.error(`${plans.length} runs planned, over --max-claude-runs ${limit}`)
  process.exit(1)
}

await mkdir(join(outDir, 'runs'), { recursive: true })
const fixture = createFixture(outDir, events)
const fill = (text: string) =>
  text.replaceAll('{project}', fixture.project).replaceAll('{mcpConfig}', fixture.mcpConfig)

if (values['dry-run']) {
  for (const plan of plans)
    console.log(
      `${plan.name}: claude ${claudeArgs(plan, fill, 1).join(' ')}  (${plan.turns.length} turns) env ${JSON.stringify(plan.env)}`,
    )
  console.log(`dry run: ${plans.length} claude -p runs, output would go to ${outDir}`)
  await rm(outDir, { recursive: true, force: true })
  process.exit(0)
}

console.log(`output: ${outDir}`)
const outcomes: RunOutcome[] = []
for (const plan of plans) {
  console.log(`run ${plan.name} (${outcomes.length + 1}/${plans.length}): ${plan.purpose}`)
  await rm(fixture.capturesDir(plan.name), { recursive: true, force: true })
  const outcome = await runSession({
    plan,
    cwd: fixture.project,
    capturesDir: fixture.capturesDir(plan.name),
    logFile: join(outDir, 'runs', `${plan.name}.jsonl`),
    fill,
  })
  outcomes.push(outcome)
  console.log(
    `  exit ${outcome.exitCode}, ${outcome.sent}/${plan.turns.length} turns sent, $${outcome.costUsd.toFixed(3)}${outcome.timedOut ? ', TIMED OUT' : ''}`,
  )
}
console.log(`claude -p runs: ${outcomes.length}; cost $${outcomes.reduce((sum, o) => sum + o.costUsd, 0).toFixed(3)}`)
await report(outDir, join(outDir, 'captures'), outcomes)
