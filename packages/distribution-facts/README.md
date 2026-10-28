# distribution-facts

Machine-readable facts about distribution channels: App Store, Apple notarization, crates.io, Google Play, npm, PyPI and Sparkle. Each fact records where it came from and, for observed facts, how to check it again.

This package is unofficial. It is not affiliated with, endorsed by, or sponsored by Apple, Google, npm, PyPI, crates.io or the Sparkle project. Product names are trademarks of their respective owners.

## Entries

Every entry is a built `index.json` under a sub-path.

| Subpath                                            | Describes                                       |
| :------------------------------------------------- | :---------------------------------------------- |
| `distribution-facts/app-store/index.json`          | Apple App Store                                 |
| `distribution-facts/apple-notarization/index.json` | Apple notarization, code signing and Gatekeeper |
| `distribution-facts/crates-io/index.json`          | crates.io                                       |
| `distribution-facts/google-play/index.json`        | Google Play                                     |
| `distribution-facts/npm/index.json`                | npm                                             |
| `distribution-facts/pypi/index.json`               | PyPI                                            |
| `distribution-facts/sparkle/index.json`            | Sparkle                                         |

## Usage

Install the package, and [`fact-kit`](https://www.npmjs.com/package/fact-kit) to read it:

```sh
pnpm add distribution-facts fact-kit
```

`readFacts` resolves the package from the current directory (or `root`), so install it where the code runs:

```ts
import { readFacts } from 'fact-kit'

const facts = readFacts('distribution-facts/app-store')
```

Or import an index directly:

```ts
import index from 'distribution-facts/app-store/index.json' with { type: 'json' }

console.log(index.facts.length)
```

## Sources and license

The package is released under the MIT License (see `LICENSE`).

No third-party text is redistributed in this package.
