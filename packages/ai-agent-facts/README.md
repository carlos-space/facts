# ai-agent-facts

Machine-readable facts about AI agent products: Claude Code, Claude Desktop and Codex. Each fact records where it came from and, for observed facts, how to check it again.

This package is unofficial. It is not affiliated with, endorsed by, or sponsored by Anthropic or OpenAI. Product names are trademarks of their respective owners.

## Entries

Every entry is a built `index.json` under a sub-path.

| Subpath                                    | Describes      |
| :----------------------------------------- | :------------- |
| `ai-agent-facts/claude-code/index.json`    | Claude Code    |
| `ai-agent-facts/claude-desktop/index.json` | Claude Desktop |
| `ai-agent-facts/codex/index.json`          | Codex          |

## Usage

Install the package, and [`fact-kit`](https://www.npmjs.com/package/fact-kit) to read it:

```sh
pnpm add ai-agent-facts fact-kit
```

`readFacts` resolves the package from the current directory (or `root`), so install it where the code runs:

```ts
import { readFacts } from 'fact-kit'

const facts = readFacts('ai-agent-facts/claude-code')
facts.value('claude-code.hook-events')
```

Or import an index directly:

```ts
import index from 'ai-agent-facts/claude-code/index.json' with { type: 'json' }

console.log(index.facts.length)
```

## Sources and license

The package is released under the MIT License (see `LICENSE`).

Converted facts are derived from openai/codex (Apache-2.0). The Claude Agent SDK is read only for names and types, and none of its documentation text is included. Copyright notices and license terms of these sources are in `NOTICE`, and the full Apache License 2.0 text is in `LICENSE-APACHE-2.0`.
