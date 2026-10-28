import { factsOf, observedDoc } from 'fact-kit'

const mf = factsOf({
  tool: 'gh',
  topics: ['gh-cli'],
  source: observedDoc({ url: 'https://cli.github.com/manual/gh_api', fetched: '2026-09-30' }),
})

export const ghCliFacts = [
  mf.statement(
    'api-default-method',
    '`gh api` 的預設方法是 GET。帶了 `-f`、`-F` 這類請求參數而沒有 `-X` 或 `--method` 時，自動改用 POST。要讓參數當查詢字串送出，得明寫 `--method GET`',
    {
      title: 'gh api 的預設方法',
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'adding request parameters will automatically switch the request method to POST',
          hash: 'sha256:bfcd524dcfd5f5c4',
        },
        verifiedOn: '2026-09-30',
        screenedThrough: '2026-09-30',
      },
    },
  ),
  mf.statement(
    'pr-subcommands',
    '`gh pr` 的子指令有 `create`、`list`、`status`、`checkout`、`checks`、`close`、`comment`、`diff`、`edit`、`lock`、`merge`、`ready`、`reopen`、`revert`、`review`、`unlock`、`update-branch`、`view`',
    {
      title: 'gh pr 的子指令',
      topics: ['pull-request'],
      verify: {
        probe: {
          kind: 'hash',
          anchor: 'General commands gh pr create gh pr list gh pr status Targeted commands',
          hash: 'sha256:80122ffee586aff8',
        },
        verifiedOn: '2026-09-30',
        screenedThrough: '2026-09-30',
      },
      source: observedDoc({ url: 'https://cli.github.com/manual/gh_pr', fetched: '2026-09-30' }),
    },
  ),
]
