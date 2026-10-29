# devtool-facts

Machine-readable facts about developer tools: gfm, gh, git, go, pnpm, release-please, semver, Tart, TypeScript and wrangler. Each fact records where it came from and, for observed facts, how to check it again.

This package is unofficial. It is not affiliated with, endorsed by, or sponsored by GitHub, Google, Cirrus Labs, Cloudflare, Microsoft or the maintainers of these tools. Product names are trademarks of their respective owners.

## Entries

Every entry is a built `index.json` under a sub-path.

| Subpath                                   | Describes                      |
| :---------------------------------------- | :----------------------------- |
| `devtool-facts/gfm/index.json`            | GitHub Flavored Markdown       |
| `devtool-facts/gh/index.json`             | the GitHub CLI (gh)            |
| `devtool-facts/git/index.json`            | git                            |
| `devtool-facts/go/index.json`             | the Go toolchain (go)          |
| `devtool-facts/pnpm/index.json`           | pnpm                           |
| `devtool-facts/release-please/index.json` | release-please                 |
| `devtool-facts/semver/index.json`         | Semantic Versioning (semver)   |
| `devtool-facts/tart/index.json`           | Tart (tart)                    |
| `devtool-facts/typescript/index.json`     | TypeScript                     |
| `devtool-facts/wrangler/index.json`       | Cloudflare Wrangler (wrangler) |

## Usage

Install the package, and [`fact-kit`](https://www.npmjs.com/package/fact-kit) to read it:

```sh
pnpm add devtool-facts fact-kit
```

`readFacts` resolves the package from the current directory (or `root`), so install it where the code runs:

```ts
import { readFacts } from 'fact-kit'

const facts = readFacts('devtool-facts/gfm')
```

Or import an index directly:

```ts
import index from 'devtool-facts/gfm/index.json' with { type: 'json' }

console.log(index.facts.length)
```

## Sources and license

The package is released under the MIT License (see `LICENSE`).

Converted facts are derived from SchemaStore (Apache-2.0). Copyright notices and license terms of these sources are in `NOTICE`, and the full Apache License 2.0 text is in `LICENSE-APACHE-2.0`.
