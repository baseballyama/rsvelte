# Public `parse()` AST parity ratchet

Gate: `scripts/compat-corpus/parse-ast-verify.mjs`.
Ratchet: `parse-ast-known-failures.json`, currently **695 entries**.

## The question it asks

`parse()` is a documented export of `svelte/compiler`, separate from `compile()`, and it is what
svelte2tsx, `eslint-plugin-svelte` and an editor integration read. Until this gate landed
(#3389) **nothing in the repository compared its return value to official's.** The corpus gates
compare `compile()` output; the svelte2tsx and lint gates consume rsvelte's own AST and never
diff it against upstream's.

The two suites that come closest are the `Parser Modern` / `Parser Legacy` rows of the
compatibility report (`crates/rsvelte_core/tests/parser_fixtures.rs`), and they answer a
narrower question three ways over: they call rsvelte's **internal** `parse` rather than the
exported entry point, they pick the AST mode from the fixture's directory rather than from an
option, and `normalize_json` deletes `loc.*.character` from both sides before the assert.

## Unit and key

One `(corpus entry, axis)` pair; axes are `modern` (`{ modern: true }`), `legacy` (no options —
the default shape) and `loose` (seven inline sources). Both sides go through
`JSON.parse(JSON.stringify(...))` first.

The ratchet key is a **field, not a file**: `<axis>::<NodeType>.<field>#<kind>`, where the node
type is the `type` of the nearest enclosing typed object and the kind is `missing` (absent on
rsvelte's side), `extra`, `value`, `type`, `length` or `span`. Two other keys were measured
first and both were worse — per entry id gives a five-figure file that churns on every submodule
bump, and per *set* of divergent paths multiplies independent defects into 472 classes over
4,468 files. The script's header carries the numbers.

Acceptance divergences are the one exception: "official rejects this document and rsvelte does
not" is a fact about the document, so those keys carry the entry id. A single shared key could not
tell two such entries from one, which is the whole shrink the ratchet exists to observe.

## Why the baseline is 695 and not 0

Because the API was never compared. The last run measured **28,209 compared pairs** over 14,102
corpus components — 5,252 modern-axis entries are byte-identical, 5,456 legacy-axis entries are,
and the remainder produce these 695 field-level keys.

The modern-axis identical count was **1,075** when this ratchet was first baselined. #3386
(`Root.end`) accounted for the other 4,177 on its own: it diverged on 12,324 of 14,102 entries, so
one key was suppressing more than a quarter of the population from ever being byte-identical.

**The key count has gone both down and up, and the up is not a regression.** #3385 (`modern` /
`loose` ignored) meant the legacy axis compared a *modern* tree against official's legacy one: 0
identical, and 11 root-shape keys standing in for a comparison that never reached a single legacy
node. Honouring the option removed those 11 (plus the 3 loose ones) and made 14,102 legacy trees
comparable for the first time, which enrolled **58 keys that describe shapes the legacy converter
alone produces** — CSS `Block` / `ComplexSelector` / `Atrule` spans, `Let.modifiers`,
`Comment.ignores`, `Text.raw`. 651 - 14 + 58 = 695. The direction that matters is the identical
count, which went 0 -> 5,456 on that axis. This is the set-diff shape AGENTS.md records for
removing an over-rejection: what the defect was hiding becomes reachable, and a count alone
reports it backwards.

**The comparator manufactures none of them.** Running the same `diffKeys` with the official
compiler on *both* sides over the same population produces **0 keys from 28,178 self-compared
pairs**. Every listed key is attributable to rsvelte's side.

**One entry in an earlier draft of this file was manufactured, and it is worth recording how.**
A `1n` literal puts a real `BigInt` in official's `Literal.value`, and `JSON.stringify` throws on
one. The round-trip sat inside the same `try` as the parse, so 11 corpus entries were recorded as
`official-rejects` — "rsvelte accepts a document the official parser refuses" — when official had
parsed all 11 without complaint. The verdict named the loudest thing it could see; the cause was
one line of the harness. Serialization now sits outside the parse `try`, and a bigint goes through
a replacer so its value stays comparable instead of being dropped.

Partition of `parse-ast-known-failures.json` by cluster: `154 + 148 + 146 + 91 + 74 + 38 + 20 + 10 + 9 + 5`

| cluster | keys | what it is |
|---|---|---|
| `node-type` | 148 | rsvelte labels a node with a different `type` than acorn/acorn-typescript does. Almost all are TypeScript nodes; the walk stops at a `type` mismatch, so each is one key rather than a spray of derived field keys. |
| `comment-attachment` | 154 | #3387 — comments never reach statements. `Program.trailingComments#extra` (1,470 entries) plus one `<NodeType>.leadingComments#missing` key per statement type that should have carried one. |
| `span` | 146 | `start` / `end` / `loc` disagree on a node type. Merged into one key per node type on purpose: they are derived from the same offsets, and split by field they were 672 keys for the same defects. |
| `unclustered` | 91 | keys nobody has classified. The cluster exists so an unclassified key reads as unclassified instead of joining someone else's row. |
| `estree-fields` | 74 | ESTree fields rsvelte's serializer omits or adds: `importKind` (6,019 entries), `exportKind`, `attributes` on an import/export, `accessor`, `typeAnnotation`, `returnType`, `optional`, `readonly`, `declare`. The lint gates already found three of these from the other side. |
| `child-count` | 38 | an array of children with a different length. |
| `accepts-what-official-rejects` | 5 | 2 corpus entries × 2 axes. See below. |
| `css-shape` | 20 | the legacy CSS selector conversion (`Selector` vs `ComplexSelector`, `combinator` / `selectors` / `name`). |
| `directive-null-fields` | 9 | official keeps `expression: null` / `modifiers: []` on a directive; rsvelte omits the key, so it is absent through the JSON boundary a binding actually uses. |
| `loc-presence` | 10 | a node that has a `loc` on one side and none on the other — kept apart from `span` because "no position at all" is a different defect from "wrong position". |

## The acceptance rows are the interesting ones

**rsvelte's `parse()` accepts 2 corpus documents official's `parse()` rejects** (2 ids x 2 axes = 4
keys), and both are one cause: `css-invalid-combinator-selector-4` (`css_selector_invalid`) and
`invalid-empty-css-declaration` (`css_empty_declaration`) are raised by upstream from `1-parse`
and by rsvelte from `2-analyze`. That is the class AGENTS.md already records for
`svelte_meta_invalid_placement` — anything that parses without analyzing sees a valid tree where
the official toolchain sees a fatal error. It is deliberately **in scope**: a drop-in `parse()`
that accepts more than official does is a divergence, and listing it here is what makes it
visible. An earlier draft of this file listed eleven more, and all eleven were the harness (see
above).

**The fifth key is the one #3385 created, and official's side of it is a crash rather than a
diagnostic.** With `loose` honoured, rsvelte recovers from `<div class="a>text</div>` and official
does not — but what official raises there is `An impossible situation occurred`, its own internal
error, not a Svelte code. The same is true of the `stray-closing-tag` control under `loose`, where
official throws `TypeError: Cannot read properties of undefined (reading 'name')`; that one is
still a both-reject only because rsvelte also refuses it. So this row records a real divergence
whose upstream half is a bug, and it is listed rather than "fixed" because matching it would mean
reproducing an internal error. Reported upstream separately.

**The `loose` half of #3385 is now green**: `unclosed-element`, `unclosed-block` and
`empty-expression` all parse on both sides, `valid-control` is byte-identical, and
`unterminated-script` and `stray-closing-tag` are still rejected by both — `loose` is not blanket
recovery on either side, so a fix that simply stopped throwing would have failed this gate rather
than passed it.

## Shrinking it

`node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline`, from a full run only (the
script refuses below 10,000 compared modern-axis pairs, and refuses under `--filter`). The
ratchet is two-sided: a key that no longer diverges fails the run, so the PR that fixes keys
re-baselines in the same PR.
