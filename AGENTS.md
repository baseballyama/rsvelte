# AGENTS.md

rsvelte (experimental) is a native toolchain written from scratch in Rust. It reads each file
once and keeps immutable trees and a database of derived facts. Each task (compile, lint, format
or type check) computes only what it needs, one file per thread. Svelte 5 comes first. The old
port on `main` is only a diff oracle and a performance baseline; do not copy its design.

## Principles

| #   | Rule                                                                                             |
| --- | ------------------------------------------------------------------------------------------------ |
| P1  | Decide structure by asking the tree. Only the lexer and parser read source bytes.                |
| P2  | One meaning, one implementation. `client`, `server` and `dev` differ by a parameter, not a copy. |
| P3  | Shared trees are immutable. Never print text and parse it again.                                 |
| P4  | One position type: `Span` (UTF-8 bytes, in one document). One integer never has two meanings.    |
| P5  | No `serde_json::Value` inside. Write public JSON directly when printing.                         |
| P6  | Semantic facts live in side tables, so trees stay `Sync`.                                        |
| P7  | Claims about speed or correctness need measurements.                                             |

Non-goals:

- Bundling and minifying
- Svelte 4 legacy mode (it falls back to the official compiler)
- Svelte 4 → 5 migration
- Text-level svelte2tsx compatibility
- A broad set of general JavaScript lint checks

## Correctness and speed

- `corpus/` holds real Svelte 5 files under permissive licenses only (MIT, Apache-2.0, ISC,
  BSD-3-Clause or Unlicense). Expected output comes from the official tools; never edit it by
  hand. `cargo test` compares every unit with it and records each verdict in the parity ratchet
  (`corpus/_registry/parity.json`); a verdict that moves fails the test. To accept an intended
  change, run with `UPDATE_EXPECT=1`.
  See [corpus/README.md](corpus/README.md) and
  [crates/language_independent/test_harness/README.md](crates/language_independent/test_harness/README.md).
- Speed: compare the official tools, `main` and this rewrite. See
  [tools/performance/README.md](tools/performance/README.md).

```sh
F=tools/oracle/oracle.ts   # zsh does not split $F into words, so keep only the path
mise exec -- node $F regen --task svelte.compile                # the official output
cargo test -p rsvelte_command_line --test corpus                # every corpus unit
FIXTURE_VERDICTS=<file> cargo test -p rsvelte_command_line --test corpus      # every file's verdict
FIXTURE_ACTUAL=1 cargo test -p rsvelte_command_line --test corpus             # write corpus actual/
cargo fmt && cargo clippy --all-targets -- -D warnings && cargo test
mise run structure
pnpm install && pnpm run check    # the site and tools/: oxfmt, oxlint, knip, tsc, the English prose lint
```

All JavaScript-side code is TypeScript that Node 26 runs directly, in one pnpm workspace
(`apps/site`, `tools/*`). A tool writes local output to its own ignored `generated/`.

## Measuring

- Never read a result through `| tail`, `| head`, `2>/dev/null` or `|| echo 0`. Use a file.
- "Nothing found" needs a positive control: add the defect, see the check fail, remove it.
- Name the tree (`git rev-parse HEAD`), the oracle version and the number of units you measured.
  Write `UNMEASURED` when you measured nothing.
- A reproduced behavior is not a cause. Mark guesses as guesses.

## Code and writing

- Write all code, comments, docs, commits and PRs in plain English.
- Comments: one line that says why. Do not describe what the code does, its history or issue
  numbers.
- Declare a module that only lists child modules inline in its parent
  (`pub mod source { pub mod document; }`). A module with code gets its own `x.rs`.
- No O(n²) in per-node code; borrow instead of clone.
- Check input once, where it enters. Do not hide a computed span or index behind
  `unwrap_or(0)` / `unwrap_or_default()`.
- Docs: say each thing once, keep it short, and prefer a command over a number in prose.

## Working here

- Other agents work here at the same time. Do not revert changes that are not yours; ask.
- No bare `git stash`, because all worktrees share one stash. One logical change per commit.
- Skills: `review` (review a branch or PR), `pr` (issue or branch to a ready PR) and `docs`
  (write or edit reader-facing text).
