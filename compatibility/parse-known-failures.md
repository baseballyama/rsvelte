# Output-parseability ratchet

Gate: the "output parseability" section of `scripts/compat-corpus/verify.mjs`.
Ratchet: `parse-known-failures.client.json` holds **8 entries**,
`parse-known-failures.client-dev.json` holds **9 entries**,
`parse-known-failures.server.json` holds **0 entries** and
`parse-known-failures.server-dev.json` holds **0 entries**.

## The question it asks

Every other comparison in `verify.mjs` is *rsvelte's text against official's text*. That makes
"wrong text" and "text that is not JavaScript" the same row, carrying the same verdict into the
same ratchet. This gate asks a question with no reference to official's bytes at all: **does
the module rsvelte emitted parse?**

A compiler may emit output we would call wrong. It may never emit output that is not
JavaScript, so this ratchet has no tolerance to spend beyond what is listed here.

## The baseline was 0 because the inputs were absent, and the enrolment proved it

Everything below the next two paragraphs was written while this ratchet was empty, and it
said so in as many words: *"the 30 defects above are in repositories that are not corpus
sources … an empty baseline here is therefore the expected result, not a measurement that
was skipped."* The wave-2 enrolment (#3130) made huly, open-webui,
carbon-components-svelte and SMUI corpus sources, along with 63 more repositories, and the
ratchet went to **12 entries across two targets on the first run**. The current tree holds
**9 unique entries across two targets** after retiring the server-dev entry, one client-only
entry and two TypeScript-parameter entries. That is the
prediction being paid out, and it is the reason blind spot 19c in
[`gate-coverage.md`](gate-coverage.md) is now closed for these inputs and for no others.

The remaining entries and repaired classes, none of them a formatting difference:

| id | acorn says | cause |
|---|---|---|
| `svelte-bits/…/CircularGallery.svelte`, `photon/…/Commands.svelte` (fixed) | `Unexpected token` | OXC stores a rest parameter outside the ordinary parameter list, so removing the TypeScript `this` parameter left its comma behind: `function (, ...args)`; the stripper now uses either kind of following runtime parameter |
| `svelte-tweakpane-ui/…/HomeDemo.svelte`, `…/TweakpaneDemo.svelte` | `Assigning to rvalue` | a store write whose **assignment target** was rewritten to a getter call: `$point4() = […]` |
| `sveltekit/…/query/instance.svelte.js` | `Assigning to rvalue` | the same class, on `$.get(this.#promise) ??= …` |
| `adventurelog/…/CollectionMap.svelte`, `…/CollectionStats.svelte`, `huly/…/FilePreviewPopup.svelte`, `huly/…/ModernEditbox.svelte`, `huly/…/NavigatorCardsSection.svelte`, `threlte/…/Sequence.svelte` | `Unexpected token` | **not yet diagnosed** — six separate spots, recorded here as data rather than as a guess |
| `threlte/…/SoftShadows.svelte` (`server-dev`, fixed by #3877) | ``Expected `,` or `)` but found `Identifier` `` | comments attached to later `$effect` statements were emitted inside the preceding derived template literal; #3877 corrected the dev component-callback tail insertion point |

Eight entries appear on `client` and `client-dev` both; `huly/…/FilePreviewPopup.svelte`
is `client-dev` only, which is the per-target split earning its keep. Both server targets are
now at 0. The former target split prevented the dev-only SoftShadows failure from suppressing
the production SSR output while it remained open.

These entries are listed, not fixed, only because the enrolment PR's job was to enrol; every
one of them breaks its consumer unconditionally and none should survive a burn-down.

## What the empty baseline was worth, as argued at the time

An empty ratchet is the weakest kind of evidence, so here is what stood behind it.

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

**So why was the ratchet empty?** Because the 30 defects above were in repositories that were
not corpus sources. `corpus-sources.json` listed sveltejs/svelte, svelte.dev and 33 shipped
libraries; huly, open-webui, carbon and SMUI were none of them. An empty baseline was
therefore the expected result, not a measurement that was skipped — and #3130 enrolled all
four, which is what the table at the top of this file is.

What that meant honestly, then: **this gate was a regression gate, not a burn-down.** It
closed the hole where a future defect of this class rides in under an existing ratchet entry,
and it closed one of the two structural blind spots recorded for gate 15 in
`gate-coverage.md` (oracle shares rsvelte's parser). It could not, by itself, find the 30
known defects — only enrolling those repositories would. It is now both: a regression gate
and a 9-entry burn-down.

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
