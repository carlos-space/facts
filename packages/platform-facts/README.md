# platform-facts

Machine-readable facts about third-party developer tools: commands, settings fields, hook events and observed behavior of Claude Code, Claude Desktop, Codex, GitHub, pnpm, npm, git and others. Each fact records where it came from and, for observed facts, how to check it again.

This package is unofficial. It is not affiliated with, endorsed by, or sponsored by Anthropic, OpenAI or GitHub. Claude, Claude Code, Codex, OpenAI and GitHub are trademarks of their respective owners.

## Entries

Every entry is a built `index.json` under a subpath.

| Subpath                                    | Describes                                      |
| :----------------------------------------- | :--------------------------------------------- |
| `platform-facts/app-store/index.json`      | Apple App Store                                |
| `platform-facts/claude-code/index.json`    | Claude Code                                    |
| `platform-facts/claude-desktop/index.json` | Claude Desktop                                 |
| `platform-facts/codex/index.json`          | Codex                                          |
| `platform-facts/crates-io/index.json`      | crates.io                                      |
| `platform-facts/fact-kit/index.json`       | fact-kit, the toolkit that builds this package |
| `platform-facts/git/index.json`            | git                                            |
| `platform-facts/github/index.json`         | GitHub                                         |
| `platform-facts/google-play/index.json`    | Google Play                                    |
| `platform-facts/npm/index.json`            | npm                                            |
| `platform-facts/pnpm/index.json`           | pnpm                                           |
| `platform-facts/pypi/index.json`           | PyPI                                           |
| `platform-facts/release-please/index.json` | release-please                                 |
| `platform-facts/typescript/index.json`     | TypeScript                                     |

## Usage

Read facts with [`fact-kit`](https://www.npmjs.com/package/fact-kit):

```ts
import { readFacts } from 'fact-kit'

const facts = readFacts('platform-facts/claude-code')
facts.value('claude-code.some-fact')
```

Or import an index directly:

```ts
import index from 'platform-facts/claude-code/index.json' with { type: 'json' }

console.log(index.facts.length)
```

## Sources and license

The package is released under the MIT License (see `LICENSE`).

Converted facts are derived from SchemaStore and openai/codex (both Apache-2.0) and from the GitHub REST API description (MIT). The Claude Agent SDK is read only for names and types, and none of its documentation text is included. Copyright notices and license terms of these sources are in `NOTICE`, and the full Apache License 2.0 text is in `LICENSE-APACHE-2.0`.
