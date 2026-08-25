# Public `parse()` AST parity ratchet

Gate: `scripts/compat-corpus/parse-ast-verify.mjs`.
Ratchet: `parse-ast-known-failures.json`, currently **856 entries**.

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

## Why the baseline is 856 and not 0

Because the API was never compared. The current full run measured **66,513 compared pairs** over
33,685 corpus components — 9,338 modern-axis and 9,653 legacy-axis entries are byte-identical,
and the remainder produce these 856 field-level keys.

The modern-axis identical count was **1,075** when this ratchet was first baselined. #3386
(`Root.end`) accounted for the other 4,177 on its own: it diverged on 12,324 of 14,102 entries, so
one key was suppressing more than a quarter of the population from ever being byte-identical.

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

Partition of `parse-ast-known-failures.json` by cluster: `194 + 184 + 136 + 116 + 102 + 54 + 25 + 24 + 10 + 5 + 4 + 2`

| cluster | keys | what it is |
|---|---|---|
| `node-type` | 194 | rsvelte labels a node with a different `type` than acorn/acorn-typescript does. Almost all are TypeScript nodes; the walk stops at a `type` mismatch, so each is one key rather than a spray of derived field keys. |
| `span` | 184 | `start` / `end` / `loc` disagree on a node type. Merged into one key per node type on purpose: they are derived from the same offsets, and split by field they were 672 keys for the same defects. |
| `comment-attachment` | 136 | #3387 — comments disagree on statements and programs; one key represents each affected node type and attachment field. |
| `unclustered` | 116 | keys nobody has classified. The cluster exists so an unclassified key reads as unclassified instead of joining someone else's row. |
| `estree-fields` | 102 | ESTree fields rsvelte's serializer omits or adds: `importKind`, `exportKind`, `attributes` on an import/export, `accessor`, `typeAnnotation`, `returnType`, `optional`, `readonly`, `declare`. The lint gates already found three of these from the other side. |
| `child-count` | 54 | an array of children with a different length. |
| `accepts-what-official-rejects` | 25 | 12 corpus entries × 2 axes, plus one loose source. See below. |
| `css-shape` | 24 | the legacy CSS selector conversion (`Selector` vs `ComplexSelector`, `combinator` / `selectors` / `name`). |
| `loc-presence` | 10 | a node that has a `loc` on one side and none on the other — kept apart from `span` because "no position at all" is a different defect from "wrong position". |
| `directive-null-fields` | 5 | official keeps `expression: null` / `modifiers: []` on a directive; rsvelte omits the key, so it is absent through the JSON boundary a binding actually uses. |
| `rejects-what-official-accepts` | 4 | 2 corpus entries × 2 axes. See below. |
| `ast-mode` | 2 | #3385 — the remaining legacy-root shape differences. |

## The acceptance rows are the interesting ones

**rsvelte's `parse()` accepts 12 collected documents official's `parse()` rejects** (12 ids ×
2 axes), plus the loose `unclosed-attribute-quote` source. The original two are one cause:
`css-invalid-combinator-selector-4` (`css_selector_invalid`) and
`invalid-empty-css-declaration` (`css_empty_declaration`) are raised by upstream from `1-parse`
and by rsvelte from `2-analyze`. That is the class AGENTS.md already records for
`svelte_meta_invalid_placement` — anything that parses without analyzing sees a valid tree where
the official toolchain sees a fatal error. It is deliberately **in scope**: a drop-in `parse()`
that accepts more than official does is a divergence, and listing it here is what makes it
visible. An earlier draft of this file listed eleven more, and all eleven were the harness (see
above).

**rsvelte throws where official accepts** on two collected components (`chatgpt-web`'s
`Home.svelte` and immich's `VideoNativeViewer.svelte`), on both axes. In the loose suite,
`unclosed-element`, `unclosed-block`, and `empty-expression` now agree; `valid-control` is the
accepted control, while `unterminated-script` and `stray-closing-tag` remain rejected by both.
`loose` is not blanket recovery on either side, so a fix that simply stopped throwing would fail
this gate rather than pass it.

## Shrinking it

`node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline`, from a full run only (the
script refuses below 10,000 compared modern-axis pairs, and refuses under `--filter`). The
ratchet is two-sided: a key that no longer diverges fails the run, so the PR that fixes keys
re-baselines in the same PR.
