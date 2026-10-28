import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'claude-code',
  topics: ['plugin'],
  source: { kind: 'observed', basis: 'doc', url: 'https://code.claude.com/docs/en/plugins-reference.md' },
})

export const pluginFacts = [
  mf.value(
    'plugin-layout',
    {
      user: [],
      project: [],
      plugin: [
        '.claude-plugin/plugin.json',
        'skills/{name}/SKILL.md',
        'commands/{name}.md',
        'agents/{name}.md',
        'hooks/hooks.json',
        '.mcp.json',
        '.lsp.json',
        'output-styles/{name}.md',
        'workflows/{name}.js',
        'themes/{name}.json',
        'monitors/monitors.json',
        'bin/{name}',
        'settings.json',
      ],
    },
    {
      title: 'plugin 的標準目錄佈局',
      topics: ['paths'],
      description:
        '`plugin` 裡的路徑都相對於 plugin 根目錄。`.claude-plugin/plugin.json` 選填，只有 `name` 必填。其他檔案放在 plugin 根目錄，不放進 `.claude-plugin/`。plugin 沒有 project 層與 user 層。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Each component type has a default location under the plugin root',
          hash: 'sha256:1e753a0ad0f7d783',
        },
        verifiedOn: '2.1.308',
      },
    },
  ),
]
