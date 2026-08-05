# Phase-3 client codegen: ship the in-place path

Twelve Phase-3 client rewrite passes were ported from collect-and-splice over
text to in-place `VisitMut` mutation of an oxc `Program`. This makes the in-place
path the one that ships, keeps the text path as the fallback, and fixes two
defects the switchover exposed.

Branch: `m1-work-recovered`. Nothing here is pushed.

## Commits

| commit | what |
|---|---|
| `fbae5332` | `compile_one` devtool — reproduce a divergence from one source file |
| `de8b2126` | score the dual-run harness on raw bytes before normalising |
| `182ab640` | stop the in-place path terminating a fragment its caller terminates |
| `625599c6` | docs: say where the printed parens actually come from |
| `4f0fdb2c` | docs: record that fragment termination is input-dependent |
| `7ef034da` | fix: let the already-wrapped guard survive a line break |
| `b49fcc3e` | **make the in-place path the one Phase-3 ships** |
| `7c98c682` | shrink the client-dev ratchet by the entry the in-place path fixes |
| `c3e4e5bc` | pin the ported passes to the output they now ship |
| `e6f910c1` | count fragments whose last token changes class, and walk the fallback |
| `b86dc59a` | decide the fragment's binding contract by parsing, not by its last byte |
| `d3d38e4c` | keep a fragment's terminator when dropping it would rebind what follows |

## Gates

All three were run on the corpus (14,027 entries × 3 targets = 39,391 JS
outputs), not on the 4,459-fixture set — a flip once emitted unparseable JS that
only the corpus population contained.

**Parseability.** `oxfmt --check` over every output of both trees: **40,186
files, 0 parse diagnostics** (JS outputs plus `error.json`). Positive control:
`const x = ;` through the same command reports `x Unexpected token` and exits 2,
so the zero is a measured zero. Corroborated twice more — `verify.mjs`'s own
oxfmt stage reports `0 parse diagnostics` for both trees, and acorn parsed both
sides of all 224 divergences.

**Raw bytes, control vs flip.** Raw trees were APFS-cloned (`cp -Rc`) before any
normalisation touched them. The official side did not move:
`diff -rq expected-control-raw expected-flip-raw` is empty. 224 files (85
entries) differ. After `7ef034da`: 221 are AST-equal (layout and comment
position), 2 collapse under oxfmt normalisation (redundant parens plus one
`EmptyStatement` the in-place path drops), and 1 is a real difference where the
in-place path is the correct side (below).

**Corpus verify.** Default build, no environment variables: exit 0, **no new
failures**, `js-unparseable 0`. One known failure now passes, so the client-dev
ratchet shrinks by exactly one entry (306 → 305). `--update-baseline` was run for
that shrink and for nothing else; `client` and `server` baselines are untouched.

**Tests.** `RUST_MIN_STACK=67108864 cargo test -p rsvelte_core -p rsvelte_esrap
--no-fail-fast` → `test result: ok` in 185 blocks, 0 failed. The repository's
only comment-sensitive gate, `client_script_comments_pin.rs`, is 4/4 green. The
esrap floor prints `74 files | 74 parseable | 74 covered (no unsupported node) |
74 byte-exact` — quoted to show it is not the vacuous "skipping" path; it is not
offered as evidence for the flip.

## What the flip fixes

`svelte-toast/src/routes/+page.svelte` (client-dev) was a known failure. The text
path dropped the `;` after a state assignment an `await` followed, running the
two together into a call chain:

```js
// official
toast.set(id, { next: 0.1 });
// text path
toast.set(id, { next: 0.1 })(await $.track_reactivity_loss(sleep(3000)))();
// in-place path
toast.set(id, { next: 0.1 });
```

## Comments

Comment multisets were compared across all 224 divergences: 216 identical
(positions move only), 6 differ only in the indentation *inside* a block comment,
and 2 have **more** comments on the in-place side — `PowerTable` goes from 72 to
88, i.e. the text path was dropping 16 comments. **No comment is lost anywhere in
the corpus.**

## Known limitation: PowerTable

`powertable/app/src/lib/components/PowerTable.svelte` (client and client-dev)
still differs in raw bytes, in three ways:

- redundant parentheses — a **regression**, cosmetic, cancelled by oxfmt;
- one `EmptyStatement` fewer — an **improvement**;
- 16 comments more — an **improvement** (see above).

Post-oxfmt the two sides are AST-equal, so this is not a ratchet entry and is not
listed in `known-failures`.

## `7ef034da` is independent of the flip

`wrap_standalone_private_reads`'s text fallback decided "already wrapped" with
`before.ends_with("$.set(")` — an adjacency test that fails as soon as the
printer breaks the line after `$.set(`, so an assignment target was wrapped as if
it were a read (`$.set($.get(this.#hoverValue), …)`). The fix is `trim_end()` on
the preceding text.

It is **control-neutral, measured**: with the fix in, the text path's output over
all 39,391 outputs is byte-identical to its output without it (`diff -rq`, 0
lines). Any change to where the printer breaks lines — a formatter change, an
esrap update — would have tripped the same guard, so this stands on its own.

## The fallback

`resolve` returns `in_place().or_else(spliced)`. The text path is kept for a
fragment the in-place path cannot parse on its own, and `RSVELTE_AST_SPLICE=1`
puts it back wholesale. The escape hatch is verified rather than asserted:
compiling the corpus with `RSVELTE_AST_SPLICE=1` reproduces the pre-flip tree
byte for byte (`diff -rq`, 0 lines over 39,391 outputs). The default path and the
previously env-forced path likewise agree to the byte.

**The fallback is reachable but was not reached**: across 13,636 corpus
components, no input made the in-place path decline where the text path
rewrote — `with_program` and `with_program_mut` share the same
`diagnostics.is_empty()` gate, so it takes a fragment that parses one way and not
the other. A seam test walks the wiring directly (both branches), since no input
in this population does.

## The fragment contract

A Phase-3 pass receives a fragment, not a program, and the caller owns what
follows it. Two invariants:

1. **The output's terminator matches the input's.** The printer terminates every
   statement, so a fragment that arrived without a `;` came back with one and the
   caller doubled it (`182ab640`).
2. **The output binds the following text the way the input did.** `x++` ends a
   statement; `$.update_prop(x)` does not, so a following `(c)` becomes its
   argument list — still valid JavaScript, which is why no parse gate can see it.

The second is enforced by parsing, not by inspecting the last byte: a trailing
`}` ends the statement when it closes a block and not when it closes an object
literal, and a byte-level reading called two harmless fragments hazardous while
missing the real one (`b86dc59a`, `d3d38e4c`).

Counter over the corpus, three values: **402 terminators dropped, 0 that changed
what follows, 2 that could not be checked** (fragments that do not stand alone,
i.e. class-member bodies — the check is silent there). Negative controls: removing
the pop gate returns the middle number to 2; reverting the caller's half changes
the corpus output in exactly the predicted 2 files.

## Not in scope

The caller-side check `!body_end.ends_with(';')` reads a raw byte, so it widens
the exposure its neighbour `ends_with('}')` already has (#447 / H-029: a raw byte
match cannot tell code from a comment or a string). It adds no new class of its
own. Lexical scanning is separate work.
