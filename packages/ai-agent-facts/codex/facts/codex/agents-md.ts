import { factsOf } from 'fact-kit'

const mf = factsOf({
  tool: 'codex',
  topics: ['agents-md'],
  source: {
    kind: 'observed',
    basis: 'doc',
    url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/core/src/agents_md.rs#L43',
  },
})

export const agentsMdFacts = [
  mf.statement(
    'agents-md-default-filename',
    'Codex 預設讀取的專案指示檔名是 `AGENTS.md`（codex-rs/core/src/agents_md.rs:43）。',
    {
      title: 'AGENTS.md 預設檔名',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'pub const DEFAULT_AGENTS_MD_FILENAME: &str = "AGENTS.md";',
          hash: 'sha256:237fb5c5f1a34a1f',
          url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/core/src/agents_md.rs#L43',
        },
        verifiedOn: '2026-10-23',
      },
    },
  ),
  mf.statement(
    'agents-md-override-filename',
    '同一目錄有 `AGENTS.override.md` 時，Codex 優先讀它，檔名常數在 codex-rs/core/src/agents_md.rs:45。',
    {
      title: 'AGENTS.md 覆寫檔名',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'pub const LOCAL_AGENTS_MD_FILENAME: &str = "AGENTS.override.md";',
          hash: 'sha256:23d63f6d8e71f8a5',
          url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/core/src/agents_md.rs#L45',
        },
        verifiedOn: '2026-10-23',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/core/src/agents_md.rs#L45',
      },
    },
  ),
  mf.statement(
    'agents-md-max-bytes',
    '專案指示檔的預設大小上限 `project_doc_max_bytes` 是 32768 位元組，即 32 * 1024（codex-rs/config/src/config_toml.rs:75）。',
    {
      title: 'AGENTS.md 預設大小上限',
      topics: ['config'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'pub const DEFAULT_PROJECT_DOC_MAX_BYTES: usize = 32 * 1024;',
          hash: 'sha256:f221ac33bd5d21a4',
          url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/config/src/config_toml.rs#L75',
        },
        verifiedOn: '2026-10-23',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/config/src/config_toml.rs#L75',
      },
    },
  ),
  mf.statement(
    'project-root-marker',
    '`project_root_markers` 沒設定時，Codex 以 `.git` 判定專案根目錄（codex-rs/config/src/project_root_markers.rs:5）。',
    {
      title: '專案根目錄預設標記',
      topics: ['config'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'const DEFAULT_PROJECT_ROOT_MARKERS: &[&str] = &[".git"];',
          hash: 'sha256:a28ef9e5798698af',
          url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/config/src/project_root_markers.rs#L5',
        },
        verifiedOn: '2026-10-23',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/config/src/project_root_markers.rs#L5',
      },
    },
  ),
  mf.statement(
    'project-doc-fallback-filenames',
    '在 config.toml 設 `project_doc_fallback_filenames`（字串清單，預設為空），可指定找不到 `AGENTS.md` 時依序嘗試的檔名（codex-rs/config/src/config_toml.rs:340）。',
    {
      title: 'AGENTS.md 備用檔名設定鍵',
      topics: ['config'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'pub project_doc_fallback_filenames: Option',
          hash: 'sha256:3d8511c059538023',
          url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/config/src/config_toml.rs#L340',
        },
        verifiedOn: '2026-10-23',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/config/src/config_toml.rs#L340',
      },
    },
  ),
  mf.value(
    'agents-md-paths',
    {
      user: ['~/.codex/AGENTS.override.md', '~/.codex/AGENTS.md'],
      project: ['{dir}/AGENTS.override.md', '{dir}/AGENTS.md'],
    },
    {
      title: 'AGENTS.md 指示檔的位置',
      topics: ['paths'],
      description:
        '每一層只讀第一個存在的檔案，先 `AGENTS.override.md` 再 `AGENTS.md`。全域層只用第一個非空檔案。專案層從專案根目錄走到工作目錄，檔案由根往下串接，越近的越後面。`{dir}` 是路徑上的每個目錄。',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'Codex builds an instruction chain when it starts',
          hash: 'sha256:b7a6ea883c5ddf67',
        },
        verifiedOn: '2026-10-24',
      },
      source: {
        kind: 'observed',
        basis: 'doc',
        url: 'https://learn.chatgpt.com/docs/agent-configuration/agents-md.md',
      },
    },
  ),
]
