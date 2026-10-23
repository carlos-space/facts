import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'

const root = join(import.meta.dirname, '..', '..')
const readJson = (file: string) => JSON.parse(readFileSync(join(root, file), 'utf8')) as Record<string, any>

const config = readJson('release-please-config.json')
const manifest = readJson('.release-please-manifest.json')

const expected: Record<string, string> = {
  'packages/fact-kit': 'fact-kit',
  'packages/platform-facts': 'platform-facts',
}

// On main the config lists both packages. A release branch scopes it to the one package of its train
// (cut-release.sh), so the config may list fewer packages than the manifest, never more. The manifest
// always keeps every package: release-please reads the other package's version from it, and merge-back
// restores main's entries.
test('the manifest lists every package and the config lists some of them', () => {
  expect(Object.keys(manifest).sort()).toEqual(Object.keys(expected).sort())
  const configured = Object.keys(config.packages)
  expect(configured.length).toBeGreaterThan(0)
  for (const path of configured) expect(Object.keys(manifest), path).toContain(path)
})

test('every configured path has a package.json whose name matches its component', () => {
  for (const [path, entry] of Object.entries<any>(config.packages)) {
    expect(existsSync(join(root, path, 'package.json')), path).toBe(true)
    expect(entry.component).toBe(expected[path])
    expect(entry['release-type']).toBe('node')
    const pkgName = readJson(`${path}/package.json`).name as string
    expect(pkgName.replace(/^@[^/]+\//, '')).toBe(entry.component)
  }
})

test('tags are <component>/v<version> with one version line per component', () => {
  expect(config['include-component-in-tag']).toBe(true)
  expect(config['tag-separator']).toBe('/')
  expect(config['include-v-in-tag']).toBe(true)
  expect(config['bump-minor-pre-major']).toBe(true)
  expect(config['initial-version']).toBe('0.1.0')
  expect(typeof config['separate-pull-requests']).toBe('boolean')
})

test('every package.json version equals its manifest version', () => {
  for (const path of Object.keys(config.packages)) {
    expect(readJson(`${path}/package.json`).version, path).toBe(manifest[path])
  }
})
