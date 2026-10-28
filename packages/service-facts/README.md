# service-facts

Machine-readable facts about services: Cloudflare R2, GitHub and GitHub Actions. Each fact records where it came from and, for observed facts, how to check it again.

This package is unofficial. It is not affiliated with, endorsed by, or sponsored by Cloudflare or GitHub. Product names are trademarks of their respective owners.

## Entries

Every entry is a built `index.json` under a sub-path.

| Subpath                                   | Describes      |
| :---------------------------------------- | :------------- |
| `service-facts/cloudflare-r2/index.json`  | Cloudflare R2  |
| `service-facts/github/index.json`         | GitHub         |
| `service-facts/github-actions/index.json` | GitHub Actions |

## Usage

Install the package, and [`fact-kit`](https://www.npmjs.com/package/fact-kit) to read it:

```sh
pnpm add service-facts fact-kit
```

`readFacts` resolves the package from the current directory (or `root`), so install it where the code runs:

```ts
import { readFacts } from 'fact-kit'

const facts = readFacts('service-facts/cloudflare-r2')
```

Or import an index directly:

```ts
import index from 'service-facts/cloudflare-r2/index.json' with { type: 'json' }

console.log(index.facts.length)
```

## Sources and license

The package is released under the MIT License (see `LICENSE`).

Converted facts are derived from SchemaStore (Apache-2.0), the GitHub REST API description (MIT). Copyright notices and license terms of these sources are in `NOTICE`, and the full Apache License 2.0 text is in `LICENSE-APACHE-2.0`.
