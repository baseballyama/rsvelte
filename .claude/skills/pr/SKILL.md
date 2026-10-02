---
name: pr
description: Everything about a pull request - create it (title, body), then loop "rebase -> answer review comments -> fix CI" until it is done, then mark it ready. Also use for one step only - "fix CI", "CI is red", "respond to the review", "finish this PR". Usage - /pr [PR number] [ci|review].
user_invocable: true
---

# Pull request

- `/pr` with no PR yet: create a draft PR (A), then finish it (B).
- `/pr <number>`: finish that PR (B).
- `/pr <number> ci` or `/pr <number> review`: run only step B3 or B2.

Never merge. Never push to `main` or `experimental` directly. Do not touch changes that are not
part of this PR; another agent may own them.

Write outputs under `SCRATCH=$(mktemp -d)`, never under a fixed shared path. Never read a result
through `| head`, `| tail`, `2>/dev/null` or `|| true`: they can turn a failure into a pass.

```bash
read -r OWNER REPO < <(gh repo view --json owner,name --jq '"\(.owner.login) \(.name)"')
PR=${PR:-$(gh pr list --head "$(git branch --show-current)" --json number --jq '.[0].number')}
```

## A. Create the PR

**Base branch**: the one the user names, else the one the script picks (it prints a
"Base branch" line and skips branches with no shared history). If none, ask.

```bash
git fetch origin
mise exec -- node .claude/scripts/plan-review-chunks.ts --format=md
```

**Title**: `<prefix>: <what changes for users of rsvelte>`. A scope is allowed: `fix(parser): ...`.

| Prefix | Use when |
|---|---|
| `feat` / `fix` / `performance` | Users can do something new / a bug they can hit is fixed / faster, same behavior |
| `refactor` | Internal change, same behavior |
| `test` / `docs` / `ci` / `build` / `deps` | Only that kind of file changes |
| `chore` | Other internal work (tools, scripts, repo setup) |
| `revert` | Reverts an earlier change |

**Body** (short; long logs go in `<details>`):

```markdown
## Why
<the problem, what is out of scope, and why this option>

## What
<the change in a few lines>

## How it was verified
- <tests and fixture compare results, with counts>
- <measurements, with the command, the tree (`git rev-parse HEAD`) and the population>

Closes #<issue>   <!-- only if fully fixed -->
```

```bash
gh pr create --draft --base "<base>" --title "..." --body-file "$SCRATCH/body.md"
```

## B. Finish the PR

Loop B1 → B2 → B3 at most 5 times. Stop early when a round changes nothing.
Print `round N: <state>` at the start of each round.

### B1. Rebase

Check you are on the PR's head branch first. A force-push from the wrong branch destroys work.

```bash
BASE=$(gh pr view "$PR" --json baseRefName -q .baseRefName)
read -r HEAD_REF IS_CROSS HEAD_OID < <(gh pr view "$PR" --json headRefName,isCrossRepository,headRefOid \
  -q '"\(.headRefName) \(.isCrossRepository) \(.headRefOid)"')
git branch --show-current                     # must be $HEAD_REF; if not, switch (ask if dirty)
git fetch origin "$HEAD_REF" "$BASE"
git merge-base --is-ancestor "$HEAD_OID" HEAD  # fails = the PR has commits you lack: stop, ask
git rebase "origin/$BASE"
git push --force-with-lease="$HEAD_REF:$HEAD_OID" origin "HEAD:$HEAD_REF"
```

- Fork PR (`IS_CROSS` is `true`): stop. You cannot push there.
- Resolve only simple conflicts (imports, lock files). Otherwise `git rebase --abort` and ask.
- Never use plain `--force`.

### B2. Review comments

Get all threads. The resolved state is only in GraphQL; `--paginate` gets more than 100.

```bash
gh api graphql --paginate -f query='
  query($owner: String!, $repo: String!, $pr: Int!, $endCursor: String) {
    repository(owner: $owner, name: $repo) { pullRequest(number: $pr) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { id isResolved path line
          comments(first: 100) { nodes { databaseId body author { login __typename } } } } } } }
  }' -f owner="$OWNER" -f repo="$REPO" -F pr="$PR" > "$SCRATCH/threads.json"
```

For each **unresolved** thread, read the current code and decide:

- **fix**: the comment's premise really holds in the code ("X can happen" — check that X can).
- **no change**: the premise does not hold, or the comment is wrong. Give concrete evidence.

Show the plan as a table (file, comment, verdict, plan) and wait for the user. When the user
asked for the whole loop without review, continue, but leave out comments that are unclear or
need a design change, and report them at the end.

Then, one comment at a time: fix, commit, push, and reply in the thread with the commit hash
(push first, so the hash exists on GitHub).

```bash
gh api "repos/$OWNER/$REPO/pulls/$PR/comments/<databaseId>/replies" -f body="Fixed: <what>. Commit: <sha>"
```

Resolve the thread **only if its first comment is from a bot** (`__typename == "Bot"`). Humans
resolve their own threads.

```bash
gh api graphql -f query='mutation($id: ID!) { resolveReviewThread(input: {threadId: $id}) { thread { isResolved } } }' -f id="<thread id>"
```

If a bot comment shows a general rule we missed, propose a one-line addition to `AGENTS.md`
or a skill. Edit only with the user's approval.

### B3. CI

```bash
gh pr checks "$PR" --repo "$OWNER/$REPO" > "$SCRATCH/checks.txt"; echo "exit=$?"
```

- **Failed or cancelled** check: a cancelled check is not a pass. Read the log in full:
  `gh run view <run_id> --repo "$OWNER/$REPO" --log-failed > "$SCRATCH/failed.log"`
  (the run id is in the check's link). Find the real cause, fix it, reproduce locally when fast,
  commit, push. For infra errors, rerun once: `gh run rerun <run_id> --failed`.
- **No checks at all**: not a pass. Report it.
- Never edit `fixtures/**/expected/` to make a check pass. That output comes from the official
  tools.

Wait (set the Bash timeout to 600000):

```bash
bash .claude/skills/pr/wait-ci.sh "$OWNER" "$REPO" "$PR"
```

`ALL_PASSED` → B4. `FAILED` → fix again. `TIMEOUT` → run again (stop after 6 in a row).
`API_ERROR` → show it and stop.

### B4. Done?

Review bots often post **after** CI. Poll the threads again for a few minutes; go on only when
two polls in a row show nothing new.

| State | Next |
|---|---|
| Base did not move, CI green, no unresolved comment you can handle | `gh pr ready "$PR"` |
| Something changed this round | next round |
| CI does not converge, rebase stopped, or a comment needs a design change | stop and report; do not mark ready |

Final report: rounds, fixes, comments left for humans, and the CI state.
