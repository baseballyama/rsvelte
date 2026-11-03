# GitHub Actions

This repository is public. Code from a fork must never read a secret or push.

- Pin every action to a full commit SHA with the version as a comment
  (`uses: actions/checkout@<sha> # v5.0.1`). Copy the SHA from another workflow when it exists.
- Start with `permissions: contents: read`. Give more only to the job that needs it.
- Set `timeout-minutes` on every job and `persist-credentials: false` on checkout unless a
  later step pushes.
- Never check out or run pull request code in `pull_request_target` or in any job with secrets.
- Pass `${{ github.event.* }}` to `run:` through `env:`, never directly.
- Compare with `github.event.pull_request.base.sha`, not `base.ref` (it moves).
- Concurrency group: `${{ github.workflow }}-${{ github.event_name }}-${{ github.head_ref || github.ref }}`.
- `run:` is `bash -e`: use `if ! cmd; then`, not `$?` on the next line. Write output to a file
  instead of `| tail`, `2>/dev/null` or `|| true`.
- `curl` with `--max-time` and `--fail`. Build JSON with `jq -n --arg`. Do not print whole
  error responses from outside APIs.
- Pushes made with `GITHUB_TOKEN` do not start other workflows; use a GitHub App token.
