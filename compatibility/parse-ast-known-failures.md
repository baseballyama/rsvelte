# `parse()` AST parity — known failures

`parse-ast-known-failures.json` holds 2721 entries — the shrink-only ratchet for
`scripts/compat-corpus/parse-ast-verify.mjs`, which diffs official's `parse()` output against
rsvelte's NAPI `parse()` over every `.svelte` file in `compatibility/pattern-corpus/`, under
`{ modern: true }` and under the default (legacy) shape.

One entry is `<id>::<mode>::<class>`, where the class is the JSON path with array indices
collapsed plus how the two sides differ (`:value`, `:missing`, `:extra`, `:type`, `:length`).
The class is in the key on purpose: under a flat per-file key, one listed divergence would
suppress every other field in that file, which is the failure mode recorded for
`warning-mismatch` in `matrix-known-failures.md`.

**Why the ratchet starts this large.** `parse()` is a public, documented export of
`svelte/compiler` and **no gate compared its output until this one** (#3389). 2721 is what a
first measurement of an ungated surface looks like; it is not a backlog someone allowed to grow.
The three defects the first hand-run of that probe found — #3385 (`modern` / `loose` ignored),
#3386 (`Root.end` stops at the last non-whitespace byte) and #3387 (comments never reach
statements) — are **fixed in the same PR that adds this gate**, so they are not in the counts
below.

**The unit is not the entry.** 1282 (file, mode) pairs are compared; **494** of them diverge in
at least one class, and those 494 produce the 2721 class instances. A single root cause can
therefore hold hundreds of entries, which is why the partition below is by cause rather than by
count of files.

Partition of `parse-ast-known-failures.json` by cause: `1395 + 681 + 392 + 201 + 24 + 13 + 10 + 5`

## 1. Template nodes — 1395

Everything under `.fragment` (modern) or `.html` (legacy) that is not a `loc.*.character`
difference. The identified sub-causes, largest first:

- **`attributes[].expression.loc:extra` / `attributes[].modifiers:missing`** — rsvelte attaches a
  `loc` to a directive's expression where official has none, and omits the `modifiers` array
  official carries on a directive. Both are field-set differences, invisible to every gate that
  reads compiled text.
- **legacy `html.start` / `html.end`** — official's legacy `html` fragment spans from offset 0
  when the component opens with `<svelte:options …>`; rsvelte starts after it. Measured on
  `pattern/adversarial/elements/svelte-options-namespace.svelte`: official `[0, 185]`, rsvelte
  `[36, 185]`.
- node `start` / `end` drift inside `{#if}` / `{#each}` bodies, and the expression spans within
  them.

## 2. Script nodes — 681

Everything under `.instance` / `.module` other than a `body:length` (cluster 5) or a
`loc.*.character` (cluster 3). It is dominated by two shapes:

- **`body[].body.body[].accessor:extra`** (46) — rsvelte emits an `accessor` field on class
  elements that official's acorn output does not carry.
- **ESTree field-set gaps already recorded in AGENTS.md** — `importKind` on an import
  declaration and its specifiers, a `TSTypeAliasDeclaration` that never converts, `params.rest`
  on a `function` statement, a missing `returnType`. The linter and svelte2tsx read the same
  serialized program, so these are not parse-only.

## 3. `loc.*.character` — 392

Official's `loc` positions come from two different producers and rsvelte follows neither
consistently: `locate-character`'s locator returns `{ line, column, character }`, while acorn's
`locations: true` returns `{ line, column }`. So official carries `character` on a template
expression's `loc` and **not** on `Root.comments[].loc`, and rsvelte has it exactly the wrong way
round — 392 entries split between `:missing` (rsvelte lacks it where official has it) and
`:extra` (rsvelte emits it where official does not). `crates/rsvelte_core/tests/parser_fixtures.rs`
strips `character` from every `loc` before comparing, which is why the fixture suite is 100% while
this class exists.

## 4. CSS — 201

`.css` subtree shape: `prelude.children[].children[].args` and `selectors` on `:is()` / `:where()`
argument lists, a `type` that differs on the same node, and `.css.comments[].position`. The CSS
AST is compared by no other gate either — `tests/css.rs` compares *compiled* CSS text.

## 5. Dropped script statements — 24

`.instance.content.body:length`. rsvelte's `convert_statement_for_program` returns `None` for
TS-only statements, so the body is short by one and every position after it shifts. The gate stops
descending into arrays whose lengths differ, so this cause holds **one** entry per (file, mode)
instead of the ~60 it would otherwise generate. Un-listing it will make those positions comparable
for the first time, which will **add** rows to clusters 1-3 — the same coupling recorded between
the error `start` and `end` ratchets.

## 6. `<svelte:options customElement>` — 13

`.options.customElement.props.*`: official models `props` as an object with `{ label, count }`
style metadata, rsvelte as an ESTree `ObjectExpression` with `start` / `end` / `properties`.

## 7. Acceptance — 10

`<rejected-by:official>`: rsvelte's `parse()` accepts ten pattern-corpus sources the official
`parse()` rejects. This is the over-acceptance class AGENTS.md records — `parse()` raises errors
in phase 1 upstream that rsvelte raises in phase 2, so anything that parses without analysing sees
a valid tree. There are **no** `<rejected-by:rsvelte>` entries: the gate has never seen rsvelte
reject a source official accepts.

## 8. Root-level comments — 5

`._comments` / `.comments` array length and span differences left after #3387, on files where a
comment sits in a position neither walk reaches.

---

**Mode split:** 1851 of the 2721 entries are `legacy`, 870 are `modern`. The legacy shape is what
`parse()` returns **by default**, and it is the more divergent of the two — the reverse of what
the effort so far assumed, because `convert_to_legacy` is only exercised by 81 upstream fixtures
while the modern AST is what every internal consumer reads.
