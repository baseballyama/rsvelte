# Parse-oracle exclusions

`parse-oracle-excluded.json` — **2 entries**, one `(id, target)` pair per line.

The output-parseability gate in `scripts/compat-corpus/verify.mjs` parses official's module
before rsvelte's, as its own control: nothing else in the pipeline would notice a parser
configuration that rejects legal compiler output. When official's output does not parse, there
is no reference for "must parse", so that `(id, target)` pair is skipped **on both sides**.

Skipping is not free — it removes an rsvelte output from the gate — so every skipped pair is
listed here rather than absorbed, and the list is shrink-only in both directions: an
unlisted oracle rejection fails the run, and a listed pair whose official output now parses also
fails the run.

## The entries

### `compiler-errors/samples/const-tag-snippet-invalid-reference-1/main.svelte` — `client`, `client-dev`

acorn: `Identifier 'foo' has already been declared`.

This is an **early error**, not a syntax error: the text tokenises and shapes fine, and a parser
is free to accept or reject it. acorn rejects; the gate's question ("is this JavaScript?") is
about syntax, so this is a place where the oracle is stricter than the question.

The input is a `compiler-errors` sample — deliberately invalid Svelte, kept in the corpus because
error parity is gated too. Official's client codegen emits a `{@const}` binding alongside the
snippet parameter it collides with, producing two lexical declarations of `foo` in one scope. The
`server` target is unaffected and stays in the gate.

**Not a reason to widen `parseable.mjs`'s `OPTIONS`.** Disabling early-error checks (there is no
acorn option for this short of a different parser) would weaken the oracle for all ~42,000
modules to accommodate two. Two named exclusions cost less.

## Why the calibration missed it

`parseable.mjs`'s options were calibrated on 10,464 modules compiled from 3,509 **real-world**
components, where acorn rejected none. The corpus's population is not that: it includes Svelte's
own deliberately-invalid fixtures, which is exactly where a compiler is most likely to emit
something a strict parser refuses. A calibration corpus reproducing the measurement only shows
the method is sound on *its* population — see `AGENTS.md` on what a gate's inputs do and do not
contain.
