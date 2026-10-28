// Hook command of the probe: `node capture-hook.ts <Event>`, with the target directory in PROBE_CAPTURES_DIR.
// Stores the JSON Claude Code sends on stdin and prints nothing, except for WorktreeCreate, which must print the
// path of the worktree it made.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const event = process.argv[2] as string
const dir = process.env.PROBE_CAPTURES_DIR
if (!dir) throw new Error('PROBE_CAPTURES_DIR is not set')
mkdirSync(dir, { recursive: true })
const raw = readFileSync(0, 'utf8')
let input: unknown
try {
  input = JSON.parse(raw)
} catch {
  input = { __unparsed: raw }
}
const body = JSON.stringify({ __event: event, __capturedAt: new Date().toISOString(), input }, null, 2)

// Exclusive create ('wx'), so hooks running in parallel never overwrite one file.
let n = readdirSync(dir).filter((f) => f.startsWith(`${event}-`)).length + 1
for (; ; n++) {
  try {
    writeFileSync(join(dir, `${event}-${n}.json`), body, { flag: 'wx' })
    break
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
  }
}

if (event === 'WorktreeCreate') {
  const { cwd, name } = input as { cwd: string; name?: string }
  const path = join(dirname(dir), '..', 'worktrees', `${name ?? 'wt'}-${n}`)
  mkdirSync(dirname(path), { recursive: true })
  execFileSync('git', ['worktree', 'add', '--detach', path], { cwd, stdio: 'ignore' })
  process.stdout.write(`${path}\n`)
}
