# Output-parseability ratchet

Gate: the "output parseability" section of `scripts/compat-corpus/verify.mjs`.
Ratchet: `parse-known-failures.<target>.json`, currently **0 entries** for each of the four
targets.

## The question it asks

Every other comparison in `verify.mjs` is *rsvelte's text against official's text*. That makes
"wrong text" and "text that is not JavaScript" the same row, carrying the same verdict into the
same ratchet. This gate asks a question with no reference to official's bytes at all: **does
the module rsvelte emitted parse?**

A compiler may emit output we would call wrong. It may never emit output that is not
JavaScript, so this ratchet has no tolerance to spend beyond what is listed here.

## Why the baseline is 0 and what that is worth

An empty ratchet is the weakest kind of evidence, so here is what stands behind it.

**The oracle is calibrated.** `parseable.mjs` uses acorn, deliberately not OXC: rsvelte parses
JavaScript with OXC, and both existing "does it parse" checks in the repo
(`ast_equiv_batch`, `crates/rsvelte_core/tests/ast_gate_preconditions.rs`) re-use OXC, so an
acceptance quirk in the parser rsvelte depends on is invisible to all of them. Compiling 3,509
real-world components from four repositories (huly, open-webui, carbon, SMUI) with the
**official** compiler across all three targets produced 10,464 modules, of which acorn under
`parseable.mjs`'s `OPTIONS` rejected **0**. That is the positive control for "these options do
not reject legal output".

**The oracle discriminates.** On the same repositories, rsvelte emits output that no parser
accepts for 30 components. acorn rejects **30 of 30** — the same set esbuild rejects. The gate
is not merely permissive.

**The gate can move.** `scripts/dev/test-corpus-parse-gate.mjs` drives `verify.mjs` over a
synthetic corpus and asserts each of the properties this ratchet depends on, including the two
that a plausible-but-wrong implementation would break: an entry already listed in
`known-failures.<target>.json` must **not** be suppressed here, and an entry whose input the
*official* compiler rejected must still be parsed. Both were confirmed by running the test
against a mutated `verify.mjs`; both flipped.

**So why is the ratchet empty?** Because the 30 defects above are in repositories that are not
corpus sources. `scripts/compat-corpus/corpus-sources.json` lists sveltejs/svelte,
svelte.dev and 33 shipped libraries; huly, open-webui, carbon and SMUI are none of them. The
corpus's own output ratchets (`known-failures.{client,server,client-dev}.json`) are all at 0,
and an unparseable rsvelte output is necessarily byte-different from official's parseable one —
so it would already have surfaced as `js-unparseable` and been listed there. An empty baseline
here is therefore the expected result, not a measurement that was skipped.

What that means honestly: **this gate is a regression gate, not a burn-down.** It closes the
hole where a future defect of this class rides in under an existing ratchet entry, and it
closes the two structural blind spots recorded for gate 15 in `gate-coverage.md` (wrong
population, oracle shares rsvelte's parser). It does not, by itself, find the 30 known
defects — only enrolling those repositories would, and corpus size is the saturated axis
(`AGENTS.md` § "Generated shape matrix").

## Adding an entry

Don't, unless the divergence is understood and the fix is scheduled. Unparseable output breaks
every consumer of the compiler unconditionally; there is no "formatting difference" reading of
it. If an entry must be listed, give it a heading here with the acorn message, the target, and
the mechanism.

## Related list

`parse-oracle-excluded.json` is a different thing and is documented in its own paired `.md`: it
enumerates the `(id, target)` pairs where **official's** output does not parse, which the gate
skips on both sides because there is no reference to hold rsvelte to.

## What this gate does not look at

See `compatibility/gate-coverage.md` § 19 for the surveyed list. In short: CSS output, source
maps, the `.d.ts`/TSX outputs, and *semantics* — a module that parses can still be wrong, which
is what the output ratchet is for.
