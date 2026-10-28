// Builds the throwaway project directory the probe runs `claude -p` in. Hooks only record what they receive.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RunName } from './event-table.ts'

export const HOOK_SCRIPT = fileURLToPath(new URL('./capture-hook.ts', import.meta.url))
export const MCP_SERVER_SCRIPT = fileURLToPath(new URL('./mcp-elicit-server.ts', import.meta.url))

/** The `hooks` setting: one capture command per event. FileChanged watches watched.txt. */
export function hookSettings(events: readonly string[]): Record<string, unknown> {
  const hooks: Record<string, unknown> = {}
  for (const event of events) {
    const command = `node ${JSON.stringify(HOOK_SCRIPT)} ${event}`
    hooks[event] = [
      { ...(event === 'FileChanged' ? { matcher: 'watched.txt|.envrc' } : {}), hooks: [{ type: 'command', command }] },
    ]
  }
  return { hooks }
}

export interface Fixture {
  /** The project directory `claude` runs in. */
  project: string
  /** MCP config file for the `mcp` run. */
  mcpConfig: string
  capturesDir: (run: RunName) => string
}

export function createFixture(root: string, events: readonly string[]): Fixture {
  const project = join(root, 'project')
  const mcpConfig = join(root, 'mcp.json')
  const capturesDir = (run: RunName) => join(root, 'captures', run)
  // A directory from an earlier probe is reused as it is, so a rerun adds to its captures.
  if (existsSync(join(project, '.git'))) return { project, mcpConfig, capturesDir }
  const write = (rel: string, text: string) => {
    mkdirSync(join(project, rel, '..'), { recursive: true })
    writeFileSync(join(project, rel), text)
  }
  write('CLAUDE.md', '# Project rules: always be terse.\n')
  write('sub/CLAUDE.md', '# Sub rules: always be terse.\n')
  write('sub/a.txt', 'a\n')
  write('notes.txt', 'hello\n')
  write('watched.txt', 'x\n')
  write(
    '.claude/commands/hello.md',
    '---\ndescription: say hello\n---\nReply with the single word hello and nothing else. Args: $ARGUMENTS\n',
  )
  // One settings file for every run. The hook writes to the directory named by PROBE_CAPTURES_DIR, set per run.
  write('.claude/settings.json', `${JSON.stringify(hookSettings(events), null, 2)}\n`)

  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=probe', '-c', 'user.email=probe@example.invalid', ...args], {
      cwd: project,
      stdio: 'ignore',
    })
  git('init', '-q')
  git('add', '-A')
  git('commit', '-q', '-m', 'probe fixture')

  writeFileSync(
    mcpConfig,
    `${JSON.stringify({ mcpServers: { probe: { command: 'node', args: [MCP_SERVER_SCRIPT] } } }, null, 2)}\n`,
  )
  return { project, mcpConfig, capturesDir }
}
