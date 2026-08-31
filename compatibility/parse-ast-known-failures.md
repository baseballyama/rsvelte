# Public `parse()` AST parity ratchet

Gate: `scripts/compat-corpus/parse-ast-verify.mjs`.
Ratchet: `parse-ast-known-failures.json`, currently **321 entries**.

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

A third was found by reading the ratchet rather than by designing it, and it fails in the
opposite direction: the path descended into objects whose keys are **user data**. The
`<svelte:options customElement={{ props: { … } }} />` bag is keyed by the prop names the
component author chose, so one defect — official evaluates `customElement.props` into a
descriptor map, rsvelte returns the raw `ObjectExpression` — was filed under one key per name
(`props.count`, `props.foo`, `props.camelCase`, `props.anArray`, …). That makes the ratchet
**grow when a new corpus file carries a new prop name**, for a defect already listed. Measured
on `--filter custom-element`: **15 keys before, 2 after**. Such paths are listed in
`DATA_KEYED_PATHS` and collapse to `{}` exactly as array indices collapse to `[]` — no
divergence stops being reported, it is reported once instead of once per name. A key too
coarse suppresses a second defect; a key too fine invents entries for the first one.

Acceptance divergences are the one exception: "official rejects this document and rsvelte does
not" is a fact about the document, so those keys carry the entry id. A single shared key could not
tell two such entries from one, which is the whole shrink the ratchet exists to observe.

## Why the baseline is not 0

Because the API was never compared. The run that established these figures measured **66,591
compared pairs** over 33,721 corpus components — 9,446 modern-axis and 9,622 legacy-axis entries
byte-identical, with the remainder producing **482** field-level keys. **The ratchet has since
been re-baselined to 321**; the pair and byte-identical counts above belong to the 482 run and are
left as measured rather than rescaled, because no run has been made at 321 to replace them. The
partition below is counted from the current JSON.

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

Partition of `parse-ast-known-failures.json` by cluster: `78 + 62 + 50 + 45 + 44 + 16 + 14 + 9 + 2 + 1`

| cluster | keys | bases | what it is |
|---|---|---|---|
| `span` | 78 | 41 | `start` / `end` / `loc` disagree on a node type. Merged into one key per node type on purpose: they are derived from the same offsets, and split by field they were 672 keys for the same defects. |
| `node-type` | 62 | 32 | rsvelte labels a node with a different `type` than acorn/acorn-typescript does. Almost all are TypeScript nodes; the walk stops at a `type` mismatch, so each is one key rather than a spray of derived field keys. |
| `estree-fields` | 44 | 22 | ESTree fields rsvelte's serializer omits or adds: `importKind`, `exportKind`, `attributes` on an import/export, `accessor`, `typeAnnotation`, `returnType`, `optional`, `readonly`, `declare`. The lint gates already found three of these from the other side. |
| `unclustered` | 45 | 27 | keys nobody has classified. The cluster exists so an unclassified key reads as unclassified instead of joining someone else's row. |
| `comment-attachment` | 50 | 25 | #3387 — comments disagree on statements and programs; one key represents each affected node type and attachment field. #3702 fixed the walk order for five template-literal shapes in both AST modes. |
| `accepts-what-official-rejects` | 1 | 1 | the loose `unclosed-attribute-quote` source, and nothing else. See below. |
| `css-shape` | 14 | 9 | the legacy CSS selector conversion (`Selector` vs `ComplexSelector`, `combinator` / `selectors` / `name`). |
| `child-count` | 16 | 10 | an array of children with a different length. |
| `loc-presence` | 9 | 5 | a node that has a `loc` on one side and none on the other — kept apart from `span` because "no position at all" is a different defect from "wrong position". |
| `ast-mode` | 2 | 2 | #3385 — the remaining legacy-root shape differences. |

**Read the `keys` column as `bases x axis`, not as work.** A key is
`<axis>::<NodeType>.<field>#<kind>` and most node types diverge identically under `modern` and
`legacy`, so 321 keys are **174 distinct bases**: 147 appear on both axes and 27 on one
(147x2 + 27 = 321, a 1.84x collapse). The defect ceiling is 174. The per-cluster collapse is not
uniform — `estree-fields` and `comment-attachment` are 2.00x (every base is on both axes),
`css-shape` 1.56x and `child-count` 1.60x (legacy-only shapes), `ast-mode` and
`accepts-what-official-rejects` 1.00x by construction.

**No base's two axes sit in different clusters** (0 of 147), so a cluster can be worked end to end
without a key from it turning up under someone else's row. Measured directly from the JSON, which
is authoritative for the partition: the ten rows above are its `Counter(values())`.

### What the `unclustered` bases actually are (measured 2026-08-31)

Classified by reproducing each key from a minimal source with the gate's own `diffKeys` algebra,
so every line below is the ratchet's own key string, and the cause is read off the two ASTs rather
than guessed from the key name. **17 of the 27 bases reproduced; 10 did not** — an unreproduced
key means no input shape was found for it, not that it is stale.

**A. TypeScript declaration children are not serialized (7 bases).** rsvelte emits the node
envelope — `type`, `start`, `end`, `loc` — and none of its children:
`TSEnumDeclaration.id` / `.members`, `TSModuleDeclaration.id` / `.global` (and `.declare`),
`TSIndexSignature.parameters` (and `.typeAnnotation`), `TSParameterProperty.parameter` (and
`.accessibility`). This is the same gap AGENTS.md already records from the lint side — a
`TSTypeAliasDeclaration` dropped entirely, no `returnType` — and the named fix site is
`1_parse/read/expression.rs`. The probes also turn up neighbours not in this cluster:
`TSModuleBlock` is labelled `BlockStatement`, and a class's `typeParameters` and a
`PropertyDefinition`'s `typeAnnotation` are absent.

**The precondition for fixing A was measured before any of it was attempted, and it holds.** The
question was whether the existing `Option<Box<serde_json::Value>>` machinery
(`convert_ts_type_parameter_declaration` and friends, on `push_span_fields`) can reproduce
official's positions at all, since every fix here builds on it. A generic function's
`typeParameters` — built exactly that way — diverges on **zero** keys, so the answer is yes and
the remaining work is writing the missing builders rather than replacing the approach. The
sizing is *not* uniform per base: `TSIndexSignature` had one emitter and every helper already
present; `TSEnumDeclaration` has **two** emitters (a typed `JsNode` variant on the statement
path and a `Value` on the declaration path, which is itself a two-ports pair);
`TSModuleDeclaration` needs an `id` *and* a `body` whose node type and span are both wrong
(`BlockStatement` spanning the whole declaration, where official has a `TSModuleBlock` spanning
the braces); `TSParameterProperty` is unmeasured.

**`TSEnumDeclaration` is done too, and the ordering mattered.** It had **two emitters** — a typed
`JsNode::TSEnumDeclaration { start, end, loc }` on the statement path and a `Value` built inline on
the declaration path — which is itself a two-ports pair, so adding children to one of them would
have created an eleventh instance rather than closing a defect. Both now go through one
`convert_ts_enum_declaration_value`, and the variant joins the opaque `value: Box<Value>` group the
other retained TS declarations already use (`TSTypeAliasDeclaration` / `TSInterfaceDeclaration` /
`TSDeclareMethod`), so the envelope needs no new tag — it moves onto the generic `write_json_node`
escape. That **removes** `JS_TS_ENUM_DECLARATION` rather than adding a tag, and the envelope
`VERSION` still has to move (7 → 8): the object a JS caller receives changes shape even though
dispatch stays generic.

It removes the four ratcheted keys `{legacy,modern}::TSEnumDeclaration.{id,members}#missing`, plus
**two** with no carrier in the ratchet — `const#missing` and `declare#missing`, which the repro
carries because `const enum` and `declare enum` are separate acorn-typescript flags emitted in that
order. Measured: the repro reports 4 keys per axis pre-fix and 0 post-fix; over the 4,898-unit x
2-axis parse sweep exactly those four ratcheted keys leave, **0 appear and 0 change count**
(159 → 155 distinct); compile output is byte-identical over 14,694 pairs; the NAPI two-surface round
trip is 16/16, and ablating the decoder to drop `members` takes it to 4/16 on exactly the four enum
cases. One neighbour is measured and **not** carried: acorn-typescript **rejects** a computed member
key (`enum E { ['C'] = 1 }`, `js_parse_error`), so rsvelte accepting it is a separate
over-acceptance in the `param-default` / `class-modifier` family's shape, not a field divergence.

**`TSIndexSignature` is done** (`parameters`, `typeAnnotation`, `readonly`), which removes four
ratcheted keys — and those four sat in **two** clusters (`unclustered` and `estree-fields`) for
one mechanism, the same split recorded under B. A fifth key it closes, `readonly#missing`, has no
carrier at all. Its `leadingComments#missing` is untouched and belongs to `comment-attachment`: a
`Value`-built node never reaches `ser_comments!`. One measured neighbour is **not** fixed —
`class C { static [k: string]: number }` drops the member entirely (`ClassBody.body[]#length`),
because a class element goes through two further converters, the pair that also drops a
`static {}` block.

**B. A field with the wrong shape rather than a missing one (4 bases) — and this grouping was
wrong.** It was cut by the KEY's shape (`#type` / `#extra` rather than `#missing`), and measuring
the four split them three ways.

*Two are one family with two more bases filed in other clusters, and it is FIXED.*
`ImportExpression.options#extra` and `ExportNamedDeclaration.attributes#extra` are the same
mechanism as `ImportDeclaration.attributes#extra` (`estree-fields`) and
`ImportDeclaration.attributes[]#length` (`child-count`): **acorn and acorn-typescript emit
different node shapes, and rsvelte emitted acorn's under both.** So one mechanism spanned three
cluster rows — the partition is by key shape, not by cause. A 41-construct x plain/`lang="ts"` x
2-axis grid found five such shapes, of which only two had a corpus carrier; the tree went from 32
cells carrying 20 distinct keys to 8 carrying 4. Pinned by
`crates/rsvelte_core/tests/import_export_parser_shapes.rs` and two pattern-corpus files.

*One is really cluster A.* `ClassDeclaration.implements` is a boolean `true` where official has an
array of `TSExpressionWithTypeArguments`, and the node stores a `bool` (`ast/typed_expr.rs:521`)
because the TypeScript children are not serialized — the same cause as A, reached through a
different key kind.

*One is not a compiler defect at all.* `Literal.value` for a bigint is `null` because
`parse()`'s NAPI binding returns a JSON **string**, which cannot express a `BigInt`. Measured on
one input: official `{"value": 123n, "bigint": "123", "raw": "123n"}`, rsvelte
`{"value": null, "bigint": "123", "raw": "123n"}` — **`bigint` and `raw` agree exactly, so no
information is lost.** Matching would mean emitting the gate harness's own `{"__bigint__": …}`
normalization shape. It cannot be closed without changing the binding's return type, and it
should not be read as outstanding work.

**C. `Root.options.customElement.props` is raw AST, not a value (2 bases).** rsvelte emits the
`ObjectExpression` node; official emits the evaluated bag, `{ p: { reflect: true } }`. The `#extra`
and `#missing` keys are the two halves of that one substitution.

**D. `Let.modifiers` is one omitted empty array (1 base, legacy only) — FIXED, awaiting a
re-baseline.** Official emits `modifiers: []` on a `let:` attribute; `convert_let_directive` was
the one of eight directive converters that omitted it. Reproduced on both `<svelte:fragment
let:x>` and a component `let:`, and pinned by
`pattern-corpus/issues/let-directive-carries-an-empty-modifiers-array.svelte`. A 4,898-unit x
2-axis parse sweep removes exactly this one distinct key and adds none; `compile()` output is
byte-identical on all four targets, so this base was observable through no other gate.

**E. `ExpressionStatement.directive` — the statement is dropped (1 base).** A `'use strict';`
directive in an instance script does not appear in `Program.body` at all, so official's body has
one more element and the first statements have different types. AGENTS.md records the same loss
for a `FunctionBody`'s `directives`.

**E2. `export * from` never reached the program body — FIXED.** `convert_statement_for_program`
had no `ExportAllDeclaration` arm, so the statement fell through `_ => None` and vanished; it is a
cause of `{legacy,modern}::Program.body[]#length`, though that key has other causes and no
`.svelte` in `submodules/svelte` carries the shape, so **how much of that entry it moves is
unmeasured until a collected-corpus run**. `compile()` kept the statement throughout.

**F. Not reproduced (10 bases)**, listed so the next attempt starts from a smaller set:
`TSTypeParameterDeclaration.extra`, `Decorator.expression` (the parent's whole `decorators` array
is dropped, so any input reaching this key must be one where the array survives),
`Literal.regex.flags`, `Line.value`, `CSSComment.position` / `.value`, `Text.raw`,
`Attribute.name` / `.name_loc`, `Identifier.name`, `Comment.ignores[]`. Plain sources for each
(entities, CRLF, unicode escapes, `svelte-ignore` with two codes, CSS comments inside and outside
a rule, a shorthand and a spread attribute) all produce **no keys**, so the corpus reaches these
through a shape none of those covers.

## The acceptance rows are the interesting ones

**No collected document is left in this row.** The only key that remains is the loose
`unclosed-attribute-quote` source. Nine TypeScript documents left this set when the early-error
layer taught OXC's split type/value namespaces about acorn-typescript's `import type`/
value-declaration collision, and the six that were still listed — including the original two,
`css-invalid-combinator-selector-4` (`css_selector_invalid`) and `invalid-empty-css-declaration`
(`css_empty_declaration`), raised by upstream from `1-parse` and by rsvelte from `2-analyze` —
now agree on both axes. That is the class AGENTS.md already records for
`svelte_meta_invalid_placement` — anything that parses without analyzing sees a valid tree where
the official toolchain sees a fatal error. It is deliberately **in scope**: a drop-in `parse()`
that accepts more than official does is a divergence, and listing it here is what makes it
visible. An earlier draft of this file listed eleven more, and all eleven were the harness (see
above).

The custom-property block fix adds four real-world SCSS carriers to this set: gitlight's
`ScrollbarContainer.svelte`, plus trakt-web's `SearchResultsGrid.svelte`, `DropdownItem.svelte`,
and `Switch.svelte`, use Sass interpolation inside custom-property values. These entries and
the retained CSS child-count keys are measured against the corpus's pinned gitlinks; a local
working tree with newer submodule checkouts produces a different set and must not be used to
baseline this gate.

**rsvelte no longer throws on any collected component that official accepts.** The former
`chatgpt-web` `Home.svelte` and immich `VideoNativeViewer.svelte` entries were removed after the
parser fix made both axes agree. In the loose suite, `unclosed-element`, `unclosed-block`, and
`empty-expression` agree; `valid-control` is the accepted control, while `unterminated-script`
and `stray-closing-tag` remain rejected by both. `loose` is not blanket recovery on either side.

## Shrinking it

`node scripts/compat-corpus/parse-ast-verify.mjs --update-baseline`, from a full run only (the
script refuses below 10,000 compared modern-axis pairs, and refuses under `--filter`). The
ratchet is two-sided: a key that no longer diverges fails the run, so the PR that fixes keys
re-baselines in the same PR.

#3761 is the first shrink that changed which later program children the comparator could align:
retaining type aliases and interfaces removed 384 listed keys and exposed 18 keys that an earlier
missing child or node-type mismatch had stopped the walk before it could observe. The measured
baseline therefore moved from 856 to 490 keys; the 18 are existing downstream AST-shape residue,
not a claim that the newly retained declarations match on those fields.
