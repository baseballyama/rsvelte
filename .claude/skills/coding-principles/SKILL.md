---
name: coding-principles
description: Rules to keep in mind every time you write code in this repository (the Rust toolchain and the TypeScript tools). Covers cost (no O(n²), no needless clones or allocations), minimal WHY-only comments, where to validate and where not to, no magic numbers, no hidden defaults, and how to test and report. Also how to find duplicate code. Use when writing or reviewing any code.
---

# Coding principles

The design rules P1–P7 in `docs/concept.md` §4 come first. This file adds the everyday rules.

Read `references/pitfalls.md` before you work on: file paths or symlinks, cached or shared
regular expressions (TypeScript), caches or buffers that grow, or a function that skips work
for some items but must still return all of them.

## Cost

Every file in the corpus goes through this code. A small cost per node is a large cost in total.

- **No O(n²).** Do not search a list inside a loop. Build a `HashMap` / `HashSet` (Rust) or a
  `Map` / `Set` (TypeScript) once, then look up.
- **Prefix and "is inside" checks can also use a set.** Build the key for each prefix of the
  item (for example each parent path) and look each one up.
- **No needless clones or allocations in hot paths.** Borrow (`&str`, `&[T]`) instead of
  `clone()`. Use the file arena, interned atoms and `u32` spans (P5, P6). Reserve capacity
  when you know the size.
- **One source of truth.** Do not keep the same data in two structures that you must update
  together. If you must (for speed), say why in one comment line.
- **Do not guess about speed.** A cost claim needs a number from the measurement layers
  (L0–L2 in `docs/concept.md` §3-C6, rule P7).

## Comments

Write only the **WHY**, in one line, and only where the code cannot say it.

- Do not describe WHAT the code does. The code already says that.
- Do not write change history, PR numbers or issue numbers. Git keeps those.
- Do not add section banners or long doc blocks that repeat the signature.
- Check any fact you put in a comment (a limit, a version, an upstream behavior) against the
  source. Facts written from memory go stale.

```rust
// Bad: says WHAT.
// Loop over the children and push each span.

// Good: says WHY.
// Upstream visits the default value before the key, and that order changes the output.
```

## Validation: at the boundary, once

Validate data **where it enters** the program. Do not check it again after that.

| Situation | Check? |
|---|---|
| Source text, config files, CLI arguments, data from JS through NAPI, files on disk | **Yes**. Return an error or a diagnostic. Do not panic. |
| A value the type system already guarantees | No |
| A value an earlier step already checked | No |
| A case that cannot happen by contract | No. If it would be a bug, use `debug_assert!` or `unreachable!` with a reason. |

- **Do not hide a wrong computed value behind a default.** `unwrap_or(0)`,
  `unwrap_or_default()` or `?? 0` on a computed boundary (a span, an index, an offset) turns a
  bug into "the change did nothing". If the value must exist, say so with `expect("why")`. If
  it can be absent, handle the absent case on purpose.
- **Return values that mean what they say.** Do not return `true` for "I did not check". Use
  `Option` or an enum so "skipped" and "passed" are different values.
- **Convert data where it is produced, not where it is used.** A function should not guess the
  shape of its input and convert it. Explicit is better than implicit.

## Names and constants

- No magic numbers in logic. Give the value a name that says its meaning and unit:
  `const MAX_NESTING_DEPTH: usize = 256;`. A unit conversion inside such a definition
  (`64 * 1024`) is fine.
- Sort ASCII identifiers with plain comparison, not locale-aware comparison.

## Tests

- Test the real code. Do not copy the logic into the test, and do not mock internal modules.
  Mock only outside systems (network, clock) when you must.
- Test the property ("the child is removed"), not the method ("it calls X").
- When code skips work for some items, test three cases: all changed, none changed, and some
  changed.

## Reporting what you found

- **A reproduced behavior is not a cause.** Say "the output is wrong" when that is all you saw.
  Say "the cause is X" only when you observed X (a trace, a profile, a probe).
- Mark guesses as guesses. Mark "other places are probably the same" as not checked.
- **When you decide not to act on a review comment, give the concrete reason.** "It is finite"
  is not a reason. Give the real maximum and show it is acceptable.

## Finding duplicates (P2)

P2 says one meaning has one implementation. To find copies, use
[similarity](https://github.com/mizchi/similarity) (`cargo install similarity-rs similarity-ts`):

```sh
similarity-rs <dir> --threshold 0.87 --min-lines 3 --skip-test   # Rust (beta upstream)
similarity-ts <dir> --threshold 0.87 --min-lines 3               # TypeScript
```

Point it at source directories only. Never at `fixtures/`, `target/` or `node_modules/`.
Look hardest at pairs that differ only by a mode (client/server, dev/prod): make the mode a
parameter of one function. Merge only code with the same meaning, and make sure a test covers
each old copy before you merge.
