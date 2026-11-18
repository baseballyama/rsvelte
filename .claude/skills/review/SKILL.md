---
name: review
description: Review a branch or PR as the code owner - why, design, then the code chunk by chunk, until no serious finding is left. Use for "review this", "/review". Options - --quick (code only), --codex (Codex CLI as a second reviewer).
user_invocable: true
---

# Review

Show the result of each phase. Fix only what the user approves. `--quick` skips phases 1 and 2.

0. **Chunks.** Base: the user's choice > the PR's `baseRefName` > the script's choice. Run
   `git fetch origin && mise exec -- node .claude/skills/review/plan-chunks.ts --format=md [<base>]`,
   show the table, and ask if the split is fine.
1. **Why.** Read the PR, issues and commits. Does it solve the problem in the simplest way? Is
   it outside the non-goals in AGENTS.md?
2. **Design.** Check P1–P7 and the non-goals. Check the evidence: every number has a command
   that makes it. Check the corpus: expected files come only from `regen`, every change to the
   ledger (`corpus/_registry/parity/`) comes with an explanation, and every license is
   permissive. Check that no abstraction serves a need that does not exist yet.
3. **Code.** For each chunk, run one read-only reviewer subagent (`general-purpose`, foreground)
   with the prompt below. With `--codex`, also run
   `codex exec --sandbox read-only --cd "$(pwd)" "<prompt>"`. Fix approved findings and review
   the same chunk again until it has no Critical or Major finding. Ask after 5 rounds.
4. **Summary.** Verdict (Approve / Request changes / Needs discussion), open and fixed findings,
   and the files the script skipped. Ask before you commit or push.

A reviewer that did not finish (error, rate limit, timeout) did not review. Never count it as
"No findings". Never approve with a Critical or Major finding open unless the user skips it.

## Reviewer prompt

```
Review only these files. Do not edit anything. Only report.
Base: <BASE>. Files: <files>.
Run `git diff <BASE>...HEAD -- <files>`, read the code around it, and read AGENTS.md.
Check: correctness (edge cases, Unicode, CRLF, span offsets), output still
matches the oracles (evidence, not guesses), P1–P7, cost in hot paths, silent fallbacks such as
unwrap_or_default on computed values, duplication, a test that fails without the change, and
comments that say more than a short WHY.
Each finding: file:line, severity, problem, fix. If none, write exactly "No findings".
Severity: Critical = wrong output, crash, security. Major = breaks a principle, missing test,
clear cost or design problem. Minor = naming, small cleanups.
```
