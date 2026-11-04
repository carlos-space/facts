# os-facts

Machine-readable facts about operating systems and their service managers. Each fact records where it came from and, for observed facts, how to check it again.

This package is unofficial. It is not affiliated with, endorsed by, or sponsored by Apple or any operating system vendor. Product names are trademarks of their respective owners.

## Entries

Every entry is a built `index.json` under a sub-path.

| Subpath                       | Describes                          |
| :---------------------------- | :--------------------------------- |
| `os-facts/launchd/index.json` | launchd, the macOS service manager |

## Usage

Install the package, and [`fact-kit`](https://www.npmjs.com/package/fact-kit) to read it:

```sh
pnpm add os-facts fact-kit
```

## Sources and license

The package is released under the MIT License (see `LICENSE`).

No third-party text is redistributed in this package.
