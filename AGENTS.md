# AGENTS.md

rsvelte (experimental) is a native toolchain written from scratch in Rust. It reads each file
once, keeps immutable trees and a database of derived facts, and computes only what a task
needs (compile, lint, format, type check), one file per thread. Svelte 5 comes first. The old
port on `main` is only a diff oracle and a performance baseline; do not copy its design.

## Principles

| # | Rule |
|---|---|
| P1 | Decide structure by asking the tree. Only the lexer and parser read source bytes. |
| P2 | One meaning, one implementation. client/server/dev differ by a parameter, not a copy. |
| P3 | Shared trees are immutable. Never print text and parse it again. |
| P4 | One position type, `Span { file, lo, hi }` (UTF-8 bytes). One integer never has two meanings. |
| P5 | No `serde_json::Value` inside. Write public JSON directly when printing. |
| P6 | Semantic facts live in side tables, so trees stay `Sync`. |
| P7 | Claims about speed or correctness need measurements. |

Non-goals: bundling and minifying, Svelte 4 legacy mode (falls back to the official compiler),
Svelte 4 → 5 migration, text-level svelte2tsx compatibility, many general JS lint rules.

## Correctness and speed

- `fixtures/` holds real Svelte 5 files from permissive licenses only (MIT, Apache-2.0, ISC,
  BSD-3-Clause, Unlicense). Expected output comes from the official tools; never edit it by
  hand. When our output means the same thing, add an `[[adjust]]` entry to `fixture.toml`.
  See [fixtures/README.md](fixtures/README.md) and
  [crates/fixture_test/README.md](crates/fixture_test/README.md).
- Speed: compare the official tools, `main`, and this rewrite. See
  [tools/performance/README.md](tools/performance/README.md).

```sh
F=tools/fixtures/bin/fixtures.ts   # zsh: keep only the path in the variable
mise exec -- node $F compare --task svelte.compile --variant client --report <file>
cargo test -p rsvelte_svelte_compile --test fixtures            # UPDATE_EXPECT=1 to accept
cargo fmt && cargo clippy --all-targets -- -D warnings && cargo test
mise run structure
pnpm install && pnpm run check    # the site and tools/: oxfmt, oxlint, knip, tsc
```

All JavaScript-side code is TypeScript that Node 26 runs directly, in one pnpm workspace
(`apps/site`, `tools/*`). A tool writes local output to its own ignored `generated/`.

## Measuring

- Never read a result through `| tail`, `| head`, `2>/dev/null` or `|| echo 0`. Use a file.
- "Nothing found" needs a positive control: add the defect, see the check fail, remove it.
- Name the tree (`git rev-parse HEAD`) and the oracle version, and how many units you measured.
  Write `UNMEASURED` when nothing was measured.
- A reproduced behavior is not a cause. Mark guesses as guesses.

## Code and writing

- Write everything (code, comments, docs, commits, PRs) in plain, simple English.
- Comments: one-line WHY only. No WHAT, history or issue numbers.
- No O(n²) in per-node code; borrow instead of clone.
- Validate input once, where it enters. Do not hide a computed span or index behind
  `unwrap_or(0)` / `unwrap_or_default()`.
- Docs: say each thing once, keep it short, and prefer a command over a number in prose.

## Working here

- Other agents work here at the same time. Do not revert changes that are not yours; ask.
- No bare `git stash` (the stash is shared between worktrees). One logical change per commit.
- Skills: `review` (review a branch or PR) and `pr` (issue or branch to a ready PR).
