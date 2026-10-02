# AGENTS.md

## What this project is

rsvelte (experimental) is a **new native toolchain, written from scratch in Rust**.

In one sentence: it reads each source file **once**, keeps **immutable trees** and a
**database of derived facts**, and from them computes only what a task needs — compile,
lint, format, or type check — with **one file per thread**.

- Svelte 5 (runes) is the first language we support end to end.
- More languages come later (TS, Vue, HTML, CSS, Sass, Markdown, ...).
- We own every tree, including the JS/TS tree. Parsers are replaceable parts
  (oxc is one of them).
- The old rsvelte (a line-by-line port of the Svelte toolchain) lives on the `main` branch.
  We keep it as a **diff oracle** and a **performance baseline**. We do not copy its design.

The full concept, with the review of each idea, is in [docs/concept.md](docs/concept.md)
(in Japanese).

## Why we rewrite

The old port had five kinds of debt. The new design must make each of them **impossible by
structure**, not just less likely:

1. The AST was `serde_json::Value`, and building JSON took most of the allocations.
2. Statement boundaries were found by scanning characters, not by asking the tree.
3. One upstream function had two or more ports (client/server, text/AST, CLI/LSP), and
   nothing compared them.
4. Some steps printed text and parsed it again to keep transforming.
5. One integer (`loc_base`) carried two meanings for comment positions.

## Principles

Every design and every PR must follow these. A reviewer should be able to say, in one line,
why each debt above cannot happen.

| # | Rule | Stops debt |
|---|---|---|
| P1 | Decide structure by **asking the tree**. Never scan raw source bytes for structure (only the lexer and parser read bytes). | 2 |
| P2 | **One meaning, one implementation.** client/server/dev differ by a lowering *parameter*, not by a second function. | 3 |
| P3 | Shared trees are **immutable**. A transform builds a new tree. Never print text and parse it again. | 4 |
| P4 | One position type: `Span { file, lo, hi }` (UTF-8 bytes). A made-up position has its own type. One integer never has two meanings. | 5 |
| P5 | No `serde_json::Value` inside. Public JSON is written directly when printing. | 1 |
| P6 | Semantic facts live in **side tables** (`NodeIdentifier` → info), so trees stay `Sync`. | — |
| P7 | Claims about speed or correctness need **measurements** (fixtures, metrics). No guesses. | — |

Other fixed choices:

- Parallelism is **per file**. Tasks for one file run in order on one worker.
- Memory: one arena per file, `u32` spans, interned atoms.
- Tasks declare which derived facts they need. A scheduler builds the smallest plan.
  The same fact is computed only once.

## Pipeline

```
Document ─► Surface tree (lossless, per language, with embedded regions) ─► fmt
              ▼
            Semantic (scopes, bindings, types as side tables) ─► lint
              ▼
            Lowered IR (Svelte → client JS / server JS / TS projection, Sass → CSS, ...)
              ▼
            Emit (text + source map) ─► compile output, TS projection for type check
```

## Non-goals

- Bundling, minifying, tree-shaking (that is Rolldown / oxc work).
- A new implementation of Svelte 4 legacy mode. Legacy files fall back to the official
  compiler.
- Svelte 4 → 5 migration.
- Text-level compatibility with svelte2tsx output.
- Competing with oxlint on the number of general JS rules. Our strength is understanding
  templates and mixed languages.

## Milestones

M0 core (source DB, spans, diagnostics, arena, metrics, benchmark harness) → M1 Svelte parse
matches upstream `parse()` → M2 compile (client and server from one lowering) → M3 lint + fmt
on the same database → M4 type check through the TS content mapper.
Each milestone is "done" only by a measured number.

## How we know it is correct: fixtures

- `fixtures/` holds about 18,000 real Svelte 5 files, copied from repositories with a
  **permissive license only** (MIT, Apache-2.0, ISC, BSD-3-Clause, Unlicense).
  Never add files from GPL, AGPL, MPL, custom-license or no-license sources.
- The official tools (the **oracles**) made the expected output once. We compare JavaScript
  **as an AST**, not as text.
- When our output means the same thing but looks different, add a small `[[adjust]]` entry to
  that unit's `fixture.toml`. Never change a snapshot by hand.
- Details: [fixtures/README.md](fixtures/README.md).

```sh
F=tools/fixtures/bin/fixtures.ts          # in zsh, keep only the path in the variable
mise exec -- node $F stats
mise exec -- node $F compare --task svelte.compile --variant client --report <file>
mise exec -- node $F adjust
```

Tools are TypeScript, run directly by Node (version in `mise.toml`). No build step.

## Crate fixture tests

Cases live in the crate that owns the task, in `tests/fixtures/<case>/input.<ext>`. Each run
writes rsvelte's output to `<case>/actual/` (not in git), next to `<case>/expected/`. A
hand-written case expects rsvelte's own accepted output and fails on a difference. A case under
`tests/fixtures/<source>/` is copied from `fixtures/` and expects the official output; its
differences are counted, not failed. The full comparison with the oracles (as an AST) is only over
`fixtures/`. Details: [crates/fixture_test/README.md](crates/fixture_test/README.md).

```sh
cargo test -p rsvelte_svelte_compile --test fixtures [-- <case filter>]
UPDATE_EXPECT=1 cargo test -p rsvelte_svelte_compile --test fixtures   # accept new output; review the diff
```

## How we know it is fast: measurements

| Layer | What | Use |
|---|---|---|
| L0 | instruction count, allocations, peak RSS (no noise) | CI gate |
| L1 | time and allocations per file and per phase | find where a change helped |
| L2 | whole corpus time, Vite cold build, HMR p50/p99 | reports; run A/B as ABBA |

Always compare three arms: the official JS tools, old rsvelte (`main`), and this rewrite.

## Measurement discipline

These rules come from real mistakes in the old project.

- Do not read a result through a stage that can hide a failure (`| tail`, `| head`,
  `2>/dev/null`, `|| echo 0`). Write output to a file, then read the file.
- A "nothing found" result needs a **positive control**: add the defect on purpose, see the
  check fail, then remove it.
- Say which tree you measured (`git rev-parse HEAD`) and which oracle version. A branch name
  or file name is a label, not proof.
- Report the population: how many units were measured, not only how many passed.
  Write `UNMEASURED` when nothing was measured; a blank looks like zero.
- Check the type of every value you hash or count. `String(obj)` is the same for every object.

## Writing rules

**Write everything in plain English that non-native speakers can read easily.** This includes
code, comments, docs, commit messages, PR text, issues, and skills. Use short sentences and
common words. Avoid idioms. Old docs in Japanese (`docs/*.md`) are the exception until someone
translates them.

**Keep code comments to the minimum WHY.**

- Write a comment only when the code cannot say the reason itself. One line is usually enough.
- Do not describe WHAT the code does.
- Do not write history, PR numbers, issue numbers, or section banners.

**Keep docs short.**

- Say each thing once, in the place people will look for it.
- Prefer a table or a list over long text. Remove text that is no longer true.
- Put a rule here only if it is short and general. Details go to `docs/` or a skill, with a
  one-line link from here.
- Numbers written in prose go stale. Prefer a command that gives the number.

## Working in this repo

- Several agents may work in this repo at the same time. Do not revert or delete changes that
  are not yours, even if they look wrong. Ask first.
- Do not use bare `git stash` / `git stash pop` (the stash is shared between worktrees).
- One logical change per commit.
- Follow [docs/layout.md](docs/layout.md) for source layout. Run `mise run structure` to check file lengths.
- Rust commands, once the Cargo workspace exists: `cargo fmt`, `cargo clippy --all-targets -- -D warnings`, `cargo test`.

## Layout

| Path | What |
|---|---|
| `crates/` | kernel, language cores and tools, and hosts; see [crates/README.md](crates/README.md) |
| `docs/concept.md` | the concept and the reasons behind it |
| `docs/fixtures.md` | why fixtures are designed the way they are |
| `fixtures/` | the external corpus: test inputs, oracle output, per-unit notes |
| `crates/fixture_test/` | the snapshot harness for each crate's `tests/fixtures/` |
| `tools/fixtures/` | import / regen / adjust / compare tools (TypeScript) |
| `.claude/skills/` | skills for agents (table below) |
| `.claude/scripts/` | scripts that skills share |

## Skills

When you add or remove a skill, update this table in the same change.

| Skill | Use when |
|---|---|
| `coding-principles` | writing any code (always); finding duplicate code |
| `site-writing` | writing or reviewing substantial Japanese explanations on the site |
| `github-actions` | writing or reviewing `.github/workflows/` |
| `review` | reviewing a branch or PR as the code owner |
| `pr` | creating a PR, fixing its CI, answering its review comments, marking it ready |
| `gh-issue-triage` | handling a GitHub issue from reproduction to draft PR |
