---
name: review
description: Review a branch or PR as the code owner - WHY, then design (concept principles and evidence), then the code chunk by chunk, repeating until no serious finding is left. Use for "review this", "full review", "/review". Options - --quick (code only), --codex (Codex CLI as a second reviewer).
user_invocable: true
---

# Review

Show the result of each phase, fix only what the user approves, then go on. The user decides.

- `/review`: all phases.
- `/review --quick`: skip Phase 1 and 2.
- `/review --codex`: in Phase 3, also run the Codex CLI on each chunk as a second opinion.

## Step 0: Base and chunks

Base branch: the one the user names > the PR's `baseRefName` > the script's choice (it skips
branches with no shared history). If none, ask. Tell the user which base you use.

```bash
git fetch origin
SCRATCH=$(mktemp -d)
mise exec -- node .claude/scripts/plan-review-chunks.ts --format=md [<base>]
mise exec -- node .claude/scripts/plan-review-chunks.ts [<base>] > "$SCRATCH/chunks.json"
git log --oneline "$BASE"...HEAD
```

The script splits the diff into small chunks by directory and skips fixture data and lock files.
It prints how many it skipped. Show the chunk table and ask if the split is fine.

## Phase 1: WHY

Read the PR, linked issues and commits. If the reason is unclear, ask the user. Then judge:
does the change solve the problem, is it the simplest way, and does it fit `docs/concept.md`
(it is not a non-goal)? If you have concerns, list them and wait.

## Phase 2: Design

| Check | Question |
|---|---|
| Principles | Does it keep P1–P7 (`docs/concept.md` §4)? A break is Major, unless the concept is changed on purpose in the same PR. |
| Non-goals | Does it add work the concept lists as a non-goal? |
| Evidence | Is each correctness claim backed by fixtures and each speed claim by a measurement? Can each number be reproduced by a command? |
| Fixtures | Expected files only from `regen`? Each `[[adjust]]` / `[skip]` has a reason? New sources have a permissive license? |
| Simplicity | Abstraction for needs that do not exist yet? New patterns without reason? |

Report a table (OK / needs work) and numbered findings with severity. Wait for the user.

## Phase 3: Code, chunk by chunk

For each chunk, run the reviewers below in order, with the prompt in
`references/review-prompt.md` and `<FOCUS>` set to the reviewer's focus. Use the Agent tool
(`general-purpose`, not in the background). Skip a reviewer when the chunk has nothing for it.

1. **Correctness**: logic, edge cases, spans, and if output still matches the fixtures.
2. **Performance and memory**: allocations, clones, hot loops, parallel safety (P5, P6).
3. **Design**: types, module borders, one implementation per meaning (P2), names.
4. **Simplicity**: dead code, duplication, needless abstraction, comments beyond a short WHY.

With `--codex`, also run once per chunk (check `codex login status` first):

```bash
codex exec --sandbox read-only --cd "$(pwd)" "$(cat "$SCRATCH/prompt.md")"
```

A failed run (error, rate limit, timeout) is not a review. Retry once, then ask the user.

Follow the loop rules in `references/review-prompt.md`: fix, review the same chunk again, until
no Critical or Major finding is left.

## Phase 4: Summary

```
Verdict: Approve / Request changes / Needs discussion

| Chunk | Correctness | Performance | Design | Simplicity | Codex |
|---|---|---|---|---|---|
| 1. <name> | none (1 round) | skipped by user (2 left) | n/a | none | - |

Open findings: ...
Fixed: ...
Not reviewed: files the script skipped
```

Then ask before you commit and push. If there is a PR, offer to run the `pr` skill to finish it.

Never approve with a Critical or Major finding left, unless the user skips it on purpose.
Do not trust a number without the command that made it.
