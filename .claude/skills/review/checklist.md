# Review checklist

For the reviewers in phase 3 of the `review` skill. Read AGENTS.md first: this list says where
low-quality code hides in rsvelte, not what is true. If a file or helper named here has moved,
find its replacement. `cargo clippy`, `mise run structure`, oxlint, knip and `tsc` already run
in CI; do not report what they catch.

Priority: wrong output > broken principle > cost > readability.

## Correctness

- Edge cases of the input: an empty file, a byte order mark, `\r\n` line ends, non-ASCII and
  astral characters. Also a tag or expression at the first or last byte, nested and
  self-closing elements, and comments in odd places.
- Spans: UTF-8 byte offsets in one document (P4). Look for a char or UTF-16 index mixed with a
  byte index. Look for a span from one document used in another, and for slicing that can panic
  inside a character.
- Output still matches the oracle. A claim of parity needs a corpus unit or fixture that shows
  it, not a reading of the code. Every moved verdict in `corpus/_registry/parity/` comes with an
  explanation.
- `client`, `server` and `dev`: a change to one also holds for the others, or the difference is
  a parameter (P2).
- Errors and warnings: the code, message and span match the official tool.
- Panics: `unwrap`, `expect`, indexing and `as` casts on values that come from input.
- Silent fallbacks: `unwrap_or(0)`, `unwrap_or_default()`, `_ => {}` and `Option` chains that turn
  a bug into quiet wrong output.
- Shared crates: every reverse dependency (`cargo tree -i <crate>`) still builds and passes.

## Design

- The fix is at the root cause, as a structure. A run of `if`s for special cases, a flag that
  undoes another step, or a patch in a later phase for a mistake in an earlier one is Major.
- The upstream tool is the specification, not the design. Code that copies upstream structure
  that rsvelte does not need, or that reproduces an upstream bug, is Major.
- P1: structure comes from the tree; only the lexer and parser read source bytes. String search
  over source text outside them is Major.
- P3: no printing text and parsing it again. P5: no `serde_json::Value` inside. P6: semantic facts
  in side tables.
- One meaning, one implementation: search the workspace for an existing helper before accepting
  a new one. A second implementation of the same rule is Major.
- No abstraction, option, trait or extension point for a need that does not exist yet.
- Non-goals in AGENTS.md: legacy mode, Svelte 4, migration, text-level svelte2tsx parity.
- Cost: no O(n²) in per-node code, no `clone` where a borrow works, no allocation per node that
  a reused buffer avoids. A claim that something is faster needs a measurement (P7).

## Tests

- New or changed logic has a test at the lowest level that shows it: a `tests.rs` unit test, a
  crate fixture, or a corpus unit in `corpus/_own/`.
- A fix of a bug has a test that fails without the fix. Name the test and the change that would
  make it fail.
- Expected files under `corpus/` come only from `regen`; nobody edits them by hand.
- Assertions match the test name; no test passes when the feature is absent.

## Code

- Comments are one line that says why. Report as Minor any comment that restates the code, a
  banner, history, or an issue number.
- Module layout follows AGENTS.md. Declare a module that only lists children inline. A module
  with code has its own `x.rs` and its tests in `x/tests.rs`. A helper lives in the narrowest
  module that uses it.
- Check input once, where it enters; inner code does not check it again.
- Names and file layout follow the neighbors. No dead code, no commented-out code, no `TODO`
  without an owner.
- TypeScript under `tools/` and `apps/`: tests next to the code (`x.test.ts`), output in the
  tool's ignored `generated/`.
- Prose in docs, changesets and skills: plain English, each thing once, and a command rather
  than a number that will go stale.
