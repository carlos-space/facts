// Which run triggers each hook event, and why some events cannot be triggered.
// `run.ts` checks this table against HOOK_EVENTS in the converted facts before it spends anything.

export type RunName = 'main' | 'tasks' | 'mcp' | 'setup' | 'stop-failure' | 'auto-denied'

export interface EventEntry {
  /** The run whose turns should fire the event, or null when no run in this probe can. */
  run: RunName | null
  /** How the run fires it. */
  how: string
  /** Why the event cannot be triggered by `claude -p`. Set exactly when `run` is null. */
  unreachable?: string
  /** Why a reachable event did not fire in the last probe, when that happened. */
  notFired?: string
}

export const EVENT_TABLE: Record<string, EventEntry> = {
  PreToolUse: { run: 'main', how: 'any tool call' },
  PostToolUse: { run: 'main', how: 'a tool call that succeeds' },
  PostToolUseFailure: { run: 'main', how: 'a Bash command that fails' },
  PostToolBatch: { run: 'main', how: 'a batch of tool calls resolving' },
  Notification: { run: 'mcp', how: 'the elicitation response of the MCP tool' },
  UserPromptSubmit: { run: 'main', how: 'every user turn' },
  UserPromptExpansion: { run: 'main', how: 'the project slash command /hello' },
  SessionStart: { run: 'main', how: 'process start' },
  SessionEnd: { run: 'main', how: 'closing stdin' },
  Stop: { run: 'main', how: 'the end of a turn' },
  StopFailure: { run: 'stop-failure', how: 'ANTHROPIC_BASE_URL points at a closed port and retries are off' },
  SubagentStart: { run: 'main', how: 'the Agent tool' },
  SubagentStop: { run: 'main', how: 'the Agent tool returning' },
  PreCompact: { run: 'main', how: '/compact' },
  PostCompact: { run: 'main', how: '/compact' },
  PreModelSwitch: { run: 'main', how: 'the stream-json set_model request' },
  PostModelSwitch: { run: 'main', how: 'the stream-json set_model request' },
  PermissionRequest: { run: 'main', how: 'a Write in default mode, answered through the stdio permission prompt tool' },
  PermissionDenied: { run: 'auto-denied', how: 'auto mode refusing a command that posts /etc/hosts to a website' },
  Setup: { run: 'setup', how: 'the --init flag' },
  TeammateIdle: {
    run: null,
    how: 'a teammate of a team going idle',
    unreachable: 'the headless tool list has no TeamCreate, so no team exists (spike 2026-10-23, Claude Code 2.1.308)',
  },
  TaskCreated: {
    run: 'tasks',
    how: 'TaskCreate, which the spike fired with CLAUDE_CODE_ENABLE_TASKS=true (1 does not work)',
    notFired:
      'Not fired in five probe runs on 2026-10-23 (Claude Code 2.1.308). The spike run had TaskCreate, TaskGet, TaskList and TaskUpdate in its init tool list (acceptEdits, CLAUDE_CODE_ENABLE_TASKS=true, --setting-sources project, no --model, no --max-budget-usd). Every probe run listed only Task and TaskStop, and ToolSearch found no TaskCreate. Tries: (1) default permission mode, --model haiku, --max-budget-usd 1, --no-session-persistence; (2) as 1 with the session kept on disk; (3) acceptEdits, session kept; (4) acceptEdits, no --model (default opus-5-5), no budget flag, session kept; (5) as 4 with CLAUDECODE, CLAUDE_CODE_SIMPLE and CLAUDE_CODE_CHILD_SESSION removed from the environment. The cause is not found.',
  },
  TaskCompleted: {
    run: 'tasks',
    how: 'TaskUpdate to completed, after TaskCreate',
    notFired: 'Needs TaskCreate first. See TaskCreated.',
  },
  Elicitation: { run: 'mcp', how: 'a stdio MCP server calling elicitation/create' },
  ElicitationResult: { run: 'mcp', how: 'the answer to that elicitation' },
  ConfigChange: { run: 'main', how: 'writing .claude/settings.local.json during the session' },
  WorktreeCreate: {
    run: 'tasks',
    how: 'the Agent tool with isolation worktree; the hook must print the worktree path',
  },
  WorktreeRemove: {
    run: null,
    how: 'a worktree being removed',
    unreachable:
      'it did not fire after the session ended, through both --worktree and Agent isolation (spike 2026-10-23, Claude Code 2.1.308)',
  },
  InstructionsLoaded: { run: 'main', how: 'CLAUDE.md files loading, including sub/CLAUDE.md when sub/a.txt is read' },
  CwdChanged: { run: 'main', how: 'a Bash command that runs cd' },
  FileChanged: {
    run: 'tasks',
    how: 'a Bash command that appends to watched.txt in the project root, which the hook matcher watches',
  },
  DirectoryAdded: { run: 'main', how: 'the register_repo_root control request for a subdirectory of cwd' },
  MessageDisplay: { run: 'main', how: 'every assistant message' },
}

/** Differences between the table and the event list of the converted facts. Empty when they agree. */
export function checkEventTable(events: readonly string[]): string[] {
  const problems: string[] = []
  const table = new Set(Object.keys(EVENT_TABLE))
  for (const e of events) if (!table.has(e)) problems.push(`HOOK_EVENTS has ${e}, which the table lacks`)
  for (const e of table) if (!events.includes(e)) problems.push(`the table has ${e}, which HOOK_EVENTS lacks`)
  for (const [e, entry] of Object.entries(EVENT_TABLE)) {
    if ((entry.run === null) !== (entry.unreachable !== undefined)) {
      problems.push(`${e}: unreachable must be set exactly when run is null`)
    }
  }
  return problems
}
