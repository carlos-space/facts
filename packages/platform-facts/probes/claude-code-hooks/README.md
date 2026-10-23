# claude-code-hooks probe

Fires Claude Code hook events with `claude -p` and compares the JSON each event sends with the JSON Schemas in
`facts/claude-code/converted.json` (the `claude-code.hook-input.*` facts). It spends API money, so it runs by hand and not in CI.

```text
pnpm --filter platform-facts probe:hooks [--model haiku] [--only main,tasks] [--out <dir>]
                                                       [--max-claude-runs 8] [--compare-only <dir>] [--dry-run]
```

- It first checks that `HOOK_EVENTS` in the converted facts and `event-table.ts` list the same events. A new event in a
  new SDK release stops the run until the table has a row for it.
- It runs six `claude -p` sessions (`plans.ts`), each with `--setting-sources project` and `--no-session-persistence`, in
  a throwaway git project under `tmp/<date>-hook-probe/<time>/`. The hooks only write the JSON they receive.
- The report (`report.txt`, `report.json`) has one row per event: compared, not fired, or unreachable with the reason.
  For compared events it lists properties the schema lacks, required properties the input lacks, and values of the wrong type.
- `--compare-only <dir>` compares captures that already exist under `<dir>/captures/<run>/`, with no API call.
- `TeammateIdle` and `WorktreeRemove` cannot be fired from `claude -p`. `event-table.ts` records why.
