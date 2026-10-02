---
name: gh-issue-triage
description: Triage a GitHub issue end to end - reproduce it, estimate size, then either post a design proposal and stop, or fix it directly and open a draft PR for a human to check. Use for "triage this issue", "handle issue #N", or `/gh-issue-triage <issue number or URL>`.
user_invocable: true
---

# GitHub issue triage

```
Step 1: Reproduce
   ├─ cannot reproduce -> comment on the issue, STOP
   └─ reproduced -> Step 2
Step 2: Size and cause
Step 3: Needs a design first?
   ├─ yes -> post options on the issue, STOP (wait for the owner's choice)
   └─ no  -> Step 4
Step 4: Fix, add a test, open a DRAFT PR
Step 5: Comment the result on the issue
Step 6: A human checks it, then the PR is marked ready
```

Print `Step N done: <summary>` after each step. Never guess: if you cannot reproduce it, do not
fix it.

## Before you start

```bash
read -r OWNER REPO < <(gh repo view --json owner,name --jq '"\(.owner.login) \(.name)"')
gh issue view "$ISSUE" --json state,title,body,labels,author,comments
gh pr list --state open --json number,isDraft,headRefName,body \
  --jq "[.[] | select((.body | test(\"(Closes|Fixes|Resolves) #$ISSUE([^0-9]|$)\")) or (.headRefName | test(\"issue-$ISSUE([^0-9]|$)\")))]"
```

- Issue is closed: stop and tell the user.
- A draft PR for this issue already exists: do not open a second one. If the user says the check
  passed, run the `pr` skill on it (it marks the PR ready) and stop. Otherwise show the link and ask.

Post a short status comment on the issue at each of these points, so everyone can see where it is:
start, cannot reproduce, design needed, fix started, PR opened.

## Step 1: Reproduce

| Kind | How |
|---|---|
| Bug | Build the smallest input that shows it. Run it through rsvelte and through the official tool (the oracle) and compare. If the input is from a real project, check whether a fixture unit already covers it. |
| Feature request | Read the related code and find the gap. |
| Question | Read the code and docs, and describe the current behavior. |

For a bug, once you know the cause line, find the commit that introduced it:

```bash
git blame -L <start>,<end> -- <file>
git log -L :<function>:<file>
git log -S '<code snippet>' --oneline -- <file>
```

Record it as `<short sha> <title> (PR #N, date)`. If you cannot find it, write "not found" and
what you tried. Never invent one.

Cannot reproduce: comment what you tried, what you checked, why it did not reproduce, and what
information you need. Then stop.

## Step 2: Size and cause

Write down: difficulty (low / medium / high, with reason), size (small / medium / large, with
the rough number of files), the commit that introduced it, what else is affected, and one or
more fix options.

## Step 3: Does it need a design first?

Yes, if **any** of these is true:

- Difficulty is medium or higher, or size is not small.
- It touches more than one area (for example parser and emitter, or several languages).
- There are several fix options with trade-offs.
- It needs a product or API decision.
- It changes a public API, the fixture format, or the core data structures.
- It goes against a principle in `docs/concept.md`.

When unsure, choose yes. Post a comment with: the reproduction, the cause, the options (what
each one changes, pros, cons), your recommendation, and the risks. Then **stop**. Do not
create a branch or a PR. Run this skill again after the owner picks an option.

## Step 4: Fix and open a draft PR

Only when Step 3 says no, or when the owner has picked an option on the issue (link that
comment in the PR).

1. Base branch: the one the user names, else the one step A of the `pr` skill picks. If unsure,
   ask. Create `fix/issue-<N>-<short-name>` from it. Never work
   on the base branch itself.
2. Fix it.
3. **Add a test that fails before the fix and passes after.** Check both. No PR without it.
4. Create the PR with step A of the `pr` skill (draft, `Closes #<N>` in the body only if it fully fixes
   the issue).

## Step 5: Comment on the issue

Post: the PR link, "draft, waiting for a human check", the reproduction, the introducing
commit, the test you added, and a risk level (low / medium / high) with the reason. Risk is
higher when the change is wide, hard to revert, touches a public API, or changes output for
many fixture units.

## Step 6: Draft to ready

A human checks the PR. Then either they click "Ready for review", or they ask you to run this
skill again, and you run the `pr` skill on the PR. Never mark the PR ready before a human checked it.
