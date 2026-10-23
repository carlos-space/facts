// Runs one `claude -p` session in stream-json mode and feeds it the turns of a plan.
import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { createInterface } from 'node:readline'
import type { RunPlan, Turn } from './plans.ts'

export interface RunOutcome {
  run: string
  exitCode: number | null
  costUsd: number
  timedOut: boolean
  /** Turns that were sent. */
  sent: number
}

export interface DriverOptions {
  plan: RunPlan
  cwd: string
  capturesDir: string
  /** JSONL log of the session's output. */
  logFile: string
  fill: (text: string) => string
  /** Per-run time limit. */
  timeoutMs?: number
  /** Dollar limit passed to `--max-budget-usd`. */
  budgetUsd?: number
}

/** Variables of an outer Claude Code session that change the tool set of the session started here. */
const OUTER_SESSION_VARS = ['CLAUDECODE', 'CLAUDE_CODE_SIMPLE', 'CLAUDE_CODE_CHILD_SESSION']

export function probeEnv(base: NodeJS.ProcessEnv, extra: Record<string, string>): NodeJS.ProcessEnv {
  const env = { ...base, ...extra }
  for (const name of OUTER_SESSION_VARS) if (!(name in extra)) delete env[name]
  return env
}

const COMMON = [
  '-p',
  '--input-format',
  'stream-json',
  '--output-format',
  'stream-json',
  '--verbose',
  '--permission-prompt-tool',
  'stdio',
  '--setting-sources',
  'project',
]

export function claudeArgs(plan: RunPlan, fill: (text: string) => string, budgetUsd: number | undefined): string[] {
  const persistence = plan.persistSession ? [] : ['--no-session-persistence']
  return [
    ...COMMON,
    ...persistence,
    ...(budgetUsd === undefined ? [] : ['--max-budget-usd', String(budgetUsd)]),
    ...plan.flags.map(fill),
  ]
}

const settle = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function runSession(options: DriverOptions): Promise<RunOutcome> {
  const { plan, fill } = options
  const log = createWriteStream(options.logFile)
  const child = spawn('claude', claudeArgs(plan, fill, plan.noBudget ? undefined : (options.budgetUsd ?? 1)), {
    cwd: options.cwd,
    env: probeEnv(process.env, { ...plan.env, PROBE_CAPTURES_DIR: options.capturesDir }),
    stdio: ['pipe', 'pipe', 'inherit'],
  })
  const outcome: RunOutcome = { run: plan.name, exitCode: null, costUsd: 0, timedOut: false, sent: 0 }
  const send = (message: unknown) => child.stdin.write(`${JSON.stringify(message)}\n`)

  let index = 0
  let awaiting = false
  let endTimer: NodeJS.Timeout | undefined
  const finish = () => {
    clearTimeout(endTimer)
    endTimer = setTimeout(() => child.stdin.end(), 6000)
  }

  const next = async (previous?: Turn) => {
    if (previous?.kind === 'control') await settle(previous.settleMs ?? 500)
    if (previous?.kind === 'user') await settle(previous.text === '/compact' ? 3000 : 500)
    if (index >= plan.turns.length) return finish()
    const turn = plan.turns[index++] as Turn
    outcome.sent++
    awaiting = true
    if (turn.kind === 'user') send({ type: 'user', message: { role: 'user', content: fill(turn.text) } })
    else
      send({
        type: 'control_request',
        request_id: `ctl-${index}`,
        request: JSON.parse(fill(JSON.stringify(turn.request))),
      })
    current = turn
  }
  let current: Turn | undefined

  const deny = plan.denyPattern ? new RegExp(plan.denyPattern) : undefined
  createInterface({ input: child.stdout }).on('line', (line) => {
    log.write(`${line}\n`)
    let m: any
    try {
      m = JSON.parse(line)
    } catch {
      return
    }
    if (m.type === 'control_request') {
      const subtype = m.request?.subtype
      if (subtype === 'can_use_tool') {
        const refused = deny?.test(JSON.stringify(m.request.input)) ?? false
        send({
          type: 'control_response',
          response: {
            subtype: 'success',
            request_id: m.request_id,
            response: refused
              ? { behavior: 'deny', message: 'denied by probe' }
              : { behavior: 'allow', updatedInput: m.request.input },
          },
        })
      } else if (subtype === 'elicitation') {
        send({
          type: 'control_response',
          response: {
            subtype: 'success',
            request_id: m.request_id,
            response: { action: 'accept', content: { color: 'blue' } },
          },
        })
      } else {
        send({
          type: 'control_response',
          response: { subtype: 'error', request_id: m.request_id, error: 'unsupported' },
        })
      }
    } else if (m.type === 'result' && awaiting) {
      awaiting = false
      outcome.costUsd = m.total_cost_usd ?? outcome.costUsd
      void next(current)
    } else if (m.type === 'control_response' && awaiting && current?.kind === 'control') {
      awaiting = false
      void next(current)
    }
    if (index >= plan.turns.length && !awaiting) finish()
  })

  return new Promise((resolve) => {
    const timer = setTimeout(
      () => {
        outcome.timedOut = true
        child.kill()
      },
      options.timeoutMs ?? 8 * 60 * 1000,
    )
    child.on('exit', (code) => {
      clearTimeout(timer)
      clearTimeout(endTimer)
      outcome.exitCode = code
      log.end()
      resolve(outcome)
    })
    void next()
  })
}
