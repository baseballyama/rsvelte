---
name: pr
description: Take work to a ready pull request - from a GitHub issue or a branch, create a draft PR, then loop "rebase -> review comments -> CI" until done. Usage - /pr [PR number] [ci|review], /pr issue <number>.
user_invocable: true
---

# Pull request

Never merge. Never push to `main` or `experimental` directly. Do not touch changes that are not
part of this PR. Write outputs to files under `mktemp -d`, and never read them through `| head`,
`| tail`, `2>/dev/null` or `|| true`.

## From an issue (`/pr issue <N>`)

1. Stop if the issue is already closed or an open PR already handles it.
2. Reproduce it: run the smallest input through rsvelte and the official tool. If it does not
   reproduce, comment what you tried and what you need, then stop.
3. Let the owner choose when the fix is not small, touches more than one area or has options
   with trade-offs. Do the same when it changes a public API, the fixture format or a principle.
   Comment the cause, the options and your recommendation, then stop until the owner picks one.
4. Otherwise branch `fix/issue-<N>-<name>` and fix it. Add a test that fails before the fix and
   passes after it, and check both. Then create the PR below and link it on the issue.

## Create

Base: the user's choice, else the branch the work started from; ask if unsure.
Title: `<feat|fix|performance|refactor|test|docs|ci|build|deps|chore|revert>(<scope>): <change>`.
Body: `## Why`, `## What` and `## How it was verified` (commands, `git rev-parse HEAD`, counts).
Add `Closes #N` only if the PR fixes the issue fully. Create it with `gh pr create --draft`.

## Finish

Repeat at most 5 times; stop when a round changes nothing.

1. **Rebase.** Check that `git branch --show-current` is the PR head. Check that the PR head
   commit is an ancestor of `HEAD`; if not, stop and ask. Rebase on `origin/<base>` and push
   with `--force-with-lease=<head>:<old sha>`, never plain `--force`. Stop on a fork PR, or on
   a conflict that needs more than a mechanical fix.
2. **Review comments.** Get the unresolved threads through GraphQL `reviewThreads`, with
   `--paginate`. For each one, check whether its premise holds in the code. Show a plan (fix, or
   no change with evidence) and wait for the user. Fix, push, then reply with the commit hash.
   Resolve a thread only if a bot opened it.
3. **CI.** `gh pr checks <PR> --watch --fail-fast`. A cancelled check or no checks is not a pass.
   Read the full failed log (`gh run view <id> --log-failed`) and fix the real cause. Rerun
   once, and only for infrastructure errors. Never edit `corpus/**/expected/`.

Mark the PR ready (`gh pr ready`) only when CI is green and you have handled every comment you
can. Two polls some minutes apart must also show no new bot comments. For a PR from an issue,
also wait until a human has checked it. Report the rounds, the fixes, the comments left for
humans and the CI state.
