---
name: full-code-review
description: Review a branch or PR as its code owner - why, design, then every chunk of code with several reviewers, then the gates - fixing findings with the user until no Critical or Major remains. Use for "review this", "/full-code-review", "full review", and before you commit, push or open a PR.
user_invocable: true
---

# Full code review

The goal is that no low-quality code lands. Review the whole branch every time, phase by phase.
Each phase finds problems, fixes the approved ones, and only then moves on.

## Rules

- **Verify, don't trust.** This skill and `checklist.md` say where to look; the code at `HEAD`
  wins. A reviewer's finding (subagent or Codex) is a claim until you have read the cited lines
  and can state the failure. Drop what you cannot confirm, and count what you drop.
- **Every finding** has a severity, `file:line`, a failure scenario (input or state, then the
  wrong result) and a fix.
- **Fix with consent.** Show the findings of a phase or chunk in one batch; fix what the user
  approves. If the user asked only for a review, report and stop.
- **A reviewer that did not finish** (error, rate limit, timeout) did not review. Run it again;
  never count it as "no findings".
- **Never merge.** Commit or push only when the user asks.

| Severity | Meaning                                                                                                   | Handling                       |
| -------- | --------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Critical | Wrong output, a panic, a security hole, data loss                                                         | Must fix                       |
| Major    | Breaks P1–P7 or a rule in AGENTS.md, a patch instead of a root fix, missing test, clear cost, duplication | Fix unless the user waives it  |
| Minor    | Naming, a comment, a small simplification                                                                 | List them; do not loop on them |

## 0. Scope

1. Base: the user's choice, else the PR's `baseRefName`, else `origin/main`. Run
   `git fetch origin` first, and `OUT=$(mktemp -d)` for every output of this review.
2. Run `mise exec -- node .claude/skills/full-code-review/plan-chunks.ts "$BASE" --format=md`. The scope
   is everything since the merge base: commits, uncommitted edits and files Git does not track yet.
3. Show the base, the file count and the chunk table. Flag new files that look accidental
   (scratch output, screenshots, `generated/`) instead of reviewing them.

## 1. Why

Read the PR body, the linked issues and the commit messages. State the problem, who gains, and
whether the change is the simplest one that solves it. Ask the user only when the intent is
unclear or the change looks unjustified, larger than the problem, or inside a non-goal.

## 2. Design

Read the whole diff once and judge it against the Design section of `checklist.md`. The fix
must be at the root cause and reuse what exists. Each fact has one owner, and nothing is there
for a future need. Every number has a command that makes it. Report the design in three to five
lines plus findings. Settle Critical and Major with the user before phase 3.

## 3. Code, chunk by chunk

At the start, if `codex login status` passes, run
`codex review --base "$BASE" > "$OUT/codex.txt"` in the background, once for the whole branch;
otherwise record "Codex skipped". Assign its findings to chunks and verify them like the others.

Take the chunks in table order. For each one, launch one read-only `general-purpose` subagent
per lens with the prompt below. Send them **in one message** so they run in parallel:

1. **Correctness**: the Correctness and Tests sections of `checklist.md`.
2. **Design**: the Design section, against the rest of the workspace (search for existing
   helpers and similar code outside the chunk).
3. **Simplicity**: the Code section: dead code, duplication, needless abstraction, comments.

For `corpus`, `ci`, `changeset` and `docs` chunks, one reviewer with all lenses is enough.

Then merge the findings and remove duplicates, verify each one yourself, show them, and fix
what the user approves. Run again only the reviewers that reported Critical or Major, on the
touched files. Repeat until you have fixed every Critical and Major or the user has waived it. Ask
the user after 5 rounds on one chunk.

Progress line: `Chunk 2/7 (rust: crates/languages/svelte/) · round 1`.

### Reviewer prompt

```
Review only these files. Do not edit anything. Only report.
Base: <BASE> (merge base <SHA>). Files: <files>. Lens: <lens>.
Read AGENTS.md and .claude/skills/full-code-review/checklist.md first. Run
`git diff <SHA> -- <files>` (it includes uncommitted edits), then read the code around each
change and its callers.
Report every finding as: severity (Critical/Major/Minor), file:line, failure scenario (input or
state -> wrong result), fix. Report only what you can tie to a line. If none, write exactly
"No findings".
```

## 4. Gates

Run what covers the touched files, write each output to a file in `$OUT`, and read the file.
Fix failures at their cause.

- Rust: `mise run fmt`, `mise run lint`, and `cargo test` for every touched crate and its reverse
  dependencies (`cargo tree -i <crate> -e normal,dev`).
- Output changes: `cargo test -p rsvelte_command_line --test corpus`. Accept a moved verdict
  with `UPDATE_EXPECT=1` only when the user wants the move.
- TypeScript, the site or prose: `pnpm run check`.
- Fails without the fix: for each fix of a bug, make a checkout with `git worktree add` under
  `.claude/worktrees/general/`. Revert the changes outside the tests there, run the new test and
  see it fail. A test that passes there is a Major finding.
- Changeset: a change users of `rsvelte` notice needs `.changeset/<name>.md` (see the `pr`
  skill), one or two sentences for users, no implementation details.

## 5. Summary

```
## Review: Approve / Request changes / Needs discussion
Base: origin/main (merge base <sha>) · HEAD <sha> · 12 files · 4 chunks · Codex: ran / skipped

| Phase | Result | Fixed | Waived |
|---|---|---|---|
| Why | OK | – | – |
| Design | OK | 1 Major | – |
| Code | OK | 2 Major, 3 Minor | 1 Minor |
| Gates | all pass (list) | – | – |
| Fails without the fix | 2/2 tests fail | – | – |
| Changeset | added / not needed | – | – |

Dropped reviewer claims: <n> (could not confirm)
Waived: <finding> - <user's reason>
Skipped files: <from the script>
```

Approve only when you have fixed or the user has waived every Critical and Major, and every
gate passed. Ask before
you commit or push.
