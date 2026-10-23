// Downloads a pinned upstream file. The URL names a commit, and the sha256 is checked, so a rerun reads the same bytes.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface PinnedSource {
  /** Repository the file belongs to, as `owner/name`. */
  repo: string
  /** Full commit SHA the file is read at. */
  commit: string
  /** Path of the file inside the repository. */
  path: string
  /** SHA-256 of the file's bytes, hex. */
  sha256: string
  /** SPDX id of the repository's license. */
  license: string
}

const cacheDir = join(fileURLToPath(new URL('../../../..', import.meta.url)), 'tmp', 'sources')

/** Where a reader can open the file at the pinned commit. */
export const sourceUrl = (s: PinnedSource): string => `https://github.com/${s.repo}/blob/${s.commit}/${s.path}`

/** The pinned file's text, from the local cache when present, otherwise downloaded and verified. */
export async function readPinned(source: PinnedSource): Promise<string> {
  const cached = join(cacheDir, `${source.sha256}.txt`)
  const verify = (bytes: Buffer) => {
    const actual = createHash('sha256').update(bytes).digest('hex')
    if (actual !== source.sha256)
      throw new Error(`${source.repo}/${source.path}: sha256 is ${actual}, expected ${source.sha256}`)
    return bytes.toString('utf8')
  }
  try {
    return verify(await readFile(cached))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  const url = `https://raw.githubusercontent.com/${source.repo}/${source.commit}/${source.path}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  const text = verify(bytes)
  await mkdir(cacheDir, { recursive: true })
  await writeFile(cached, bytes)
  return text
}
