import type { Fact } from '../../../fact-kit/src/index.ts'

// Constants read from the source of openai/codex at rust-v0.164.0 (commit 6aaac694803004a63c6f393d153c96d22521a6b9).
// Each hash comes from the workspace document probe (external-facts/probe.mjs): the raw file is normalized,
// the 300 characters on each side of the anchor are kept, and the first 16 hex digits of their sha256 are recorded.
// The probe strips anything between < and >, so an anchor never contains angle brackets.
const BLOB = 'https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs'

const at = (file: string, line: number, code: string, hash: string) => ({
  source: { kind: 'observed' as const, basis: 'doc' as const, url: `${BLOB}/${file}#L${line}` },
  verify: {
    probe: { kind: 'hash' as const, anchor: code, hash: `sha256:${hash}`, url: `${BLOB}/${file}#L${line}` },
    verifiedOn: '2026-10-23',
  },
})

export const observed: Fact[] = [
  {
    id: 'codex.agents-md-default-filename',
    tool: 'codex',
    topics: ['agents-md'],
    title: 'AGENTS.md 預設檔名',
    content: { statement: 'Codex 預設讀取的專案指示檔名是 `AGENTS.md`（codex-rs/core/src/agents_md.rs:43）。' },
    ...at('core/src/agents_md.rs', 43, 'pub const DEFAULT_AGENTS_MD_FILENAME: &str = "AGENTS.md";', '237fb5c5f1a34a1f'),
  },
  {
    id: 'codex.agents-md-override-filename',
    tool: 'codex',
    topics: ['agents-md'],
    title: 'AGENTS.md 覆寫檔名',
    content: {
      statement: '同一目錄有 `AGENTS.override.md` 時，Codex 優先讀它，檔名常數在 codex-rs/core/src/agents_md.rs:45。',
    },
    ...at(
      'core/src/agents_md.rs',
      45,
      'pub const LOCAL_AGENTS_MD_FILENAME: &str = "AGENTS.override.md";',
      '23d63f6d8e71f8a5',
    ),
  },
  {
    id: 'codex.agents-md-max-bytes',
    tool: 'codex',
    topics: ['agents-md', 'config'],
    title: 'AGENTS.md 預設大小上限',
    content: {
      statement:
        '專案指示檔的預設大小上限 `project_doc_max_bytes` 是 32768 位元組，即 32 * 1024（codex-rs/config/src/config_toml.rs:75）。',
    },
    ...at(
      'config/src/config_toml.rs',
      75,
      'pub const DEFAULT_PROJECT_DOC_MAX_BYTES: usize = 32 * 1024;',
      'f221ac33bd5d21a4',
    ),
  },
  {
    id: 'codex.project-root-marker',
    tool: 'codex',
    topics: ['agents-md', 'config'],
    title: '專案根目錄預設標記',
    content: {
      statement:
        '`project_root_markers` 沒設定時，Codex 以 `.git` 判定專案根目錄（codex-rs/config/src/project_root_markers.rs:5）。',
    },
    ...at(
      'config/src/project_root_markers.rs',
      5,
      'const DEFAULT_PROJECT_ROOT_MARKERS: &[&str] = &[".git"];',
      'a28ef9e5798698af',
    ),
  },
  {
    id: 'codex.project-doc-fallback-filenames',
    tool: 'codex',
    topics: ['agents-md', 'config'],
    title: 'AGENTS.md 備用檔名設定鍵',
    content: {
      statement:
        '在 config.toml 設 `project_doc_fallback_filenames`（字串清單，預設為空），可指定找不到 `AGENTS.md` 時依序嘗試的檔名（codex-rs/config/src/config_toml.rs:340）。',
    },
    ...at('config/src/config_toml.rs', 340, 'pub project_doc_fallback_filenames: Option', '3d8511c059538023'),
  },
]
