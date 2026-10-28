import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['settings'],
  source: { kind: 'observed', basis: 'doc', url: 'https://code.claude.com/docs/en/settings.md' },
})

export const settingsFacts = [
  mf.value(
    'settings-paths',
    {
      managed: [
        '/Library/Application Support/ClaudeCode/managed-settings.json',
        '/etc/claude-code/managed-settings.json',
        '%ProgramFiles%\\ClaudeCode\\managed-settings.json',
      ],
      user: ['~/.claude/settings.json'],
      project: ['.claude/settings.json', '.claude/settings.local.json'],
    },
    {
      title: 'settings 檔案的位置',
      topics: ['paths'],
      description:
        'managed 層的檔名是 `managed-settings.json`，放在各作業系統的系統目錄，也可以由 claude.ai console 等其他來源送達。',
      verify: {
        probe: { kind: 'hash', anchor: 'Claude Code reads settings from four files', hash: 'sha256:768727599180e074' },
        verifiedOn: '2.1.308',
      },
    },
  ),
]
