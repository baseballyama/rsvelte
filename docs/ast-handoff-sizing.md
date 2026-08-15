# Client AST handoff: what blocks it, and what it costs

A native bundler integration would rather take rsvelte's OXC `Program` than re-parse the
JavaScript rsvelte printed. It can only do that for a program that makes **no claim about a text
it does not have**: rsvelte's spans index the `.svelte` input (and, for a comment-bearing program,
a synthetic buffer above `loc_base`), while the text the bundler will slice is the generated JS.
A span pointing into another text is worse than no span, so the consumer's acceptance test is
`comment_source.is_none() && !has_source_dependent_spans(program)` and everything else re-parses.

The instrument is `crates/rsvelte_devtools/src/bin/ast_handoff_sizing.rs`:

```bash
cargo build --release -p rsvelte_devtools --bin ast_handoff_sizing
./target/release/ast_handoff_sizing            # the six shipped corpora
./target/release/ast_handoff_sizing --dir=…    # any checkout
```

## Measurement

5,836 `.svelte` files / 9,549,619 bytes from `bits-ui`, `flowbite-svelte`, `layerchart`,
`shadcn-svelte`, `skeleton`, `svelte-ux`; client target, sourcemaps off; M1 Pro.

| handoff verdict | files | share |
|---|---:|---:|
| direct | 176 | **3.02%** |
| comment-only | 0 | **0.00%** |
| source-dependent spans only | 5,073 | 86.93% |
| comments **and** source-dependent spans | 587 | 10.06% |
| no program (converter bailed) | 0 | 0.00% |

Per repository, `direct` runs 0.4% (layerchart) to 8.6% (bits-ui). The converter never bails on
this population, so "no program" is not a contributor.

### The comment/span split the issue asked for has a degenerate answer

**Comment-only is 0 — in every one of the six repositories.** Not "small": zero. Every program
that carries comments also carries source-dependent spans, so a remedy aimed at comments alone
would move the handoff rate by nothing. That falsifies the framing that the two disqualifiers are
comparable populations to be traded off; there is one blocker, and comments ride along with it.

### There is no small set of nodes to fix

15.92% of AST nodes (515,678 / 3,240,010) carry an input-indexed span, and they are a flat tail —
the largest kind, `StaticMemberExpression`, is 7.03% of them, and nothing else reaches 4%. This
is not a leak from one converter path that could be plugged; keeping spans is what the converter
does wherever it can. Any remedy has to be total.

### What the fallback costs

| | ms | share of compile |
|---|---:|---:|
| compile (net of this probe's own conversion) | 1,436.4 | — |
| IR → OXC conversion | 95.9 | 6.68% |
| re-parse of the printed output | 107.7 | **7.50%** |
| re-parse actually paid (non-direct files only) | 107.1 | 7.46% |

Stable to three digits across repeated runs (7.50 / 8.42 / 8.44 / 8.46% across separate
invocations; the spread is machine load, not variance in the measurement — the file counts are
identical every run).

**Read this as a throughput item, not a correctness one.** The re-parse is OXC in the same Rust
process; nothing falls back to the JavaScript compiler.

## The remedy, and why it is the one that fits

`Converted::into_coordinate_free_program` removes every span and every comment, yielding a
program that indexes no text at all. The consumer's existing acceptance test then passes
**unconditionally** — and it is the consumer's *existing* test, not a new contract: the 176 files
that already hand off directly are exactly the ones whose programs happened to come out
coordinate-free on their own.

| | before | after |
|---|---:|---:|
| files the consumer can adopt | 176 (3.02%) | **5,836 (100.00%)** |
| cost | re-parse, 7.50% of compile | strip, **0.79% of compile** |

The trade is explicit and belongs to the caller: a coordinate-free program has no comments, so a
consumer that wants them in its output must print first (rsvelte's own codegen already has, by
the time the sink runs) and take the separate source map for positions. That is the shape a
production bundle wants anyway; a dev build that needs comments in the module AST should keep
re-parsing.

## What this does not answer

- **Generated-coordinate spans are still absent.** Stripping makes the program *safe* to adopt,
  not *informative*: a downstream plugin that wants to slice code by node position still cannot.
  Doing that properly means the printer reporting each node's generated offset as it writes, and
  rsvelte rewriting the spans from it — the node-kind tail above says a partial version of that
  is not worth building.
- **The population is six component libraries.** The issue's numbers come from two applications
  (Open WebUI 9/878 ≈ 1.0% direct, Appwrite Console 715/1,789 ≈ 40%). 3.02% sits inside that
  range but nearer Open WebUI; the Appwrite figure is far enough away that the *direct* share
  should be treated as repository-dependent. The 0% comment-only result is the one that holds
  uniformly here, and it is the one the choice above rests on.
