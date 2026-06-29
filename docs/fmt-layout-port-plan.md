# Formatter layout-engine port (prettier-plugin-svelte → Rust)

To drive the formatter-parity corpus (`docs/corpus-fmt-remaining-work.md`) to
zero, rsvelte's native Svelte formatter must reproduce prettier-plugin-svelte's
HTML child-layout byte-for-byte. The remaining ~123 real divergences are all
that algorithm (inline hug/break, long open-tag wrap + child breaking, prose
fill). Rather than reinvent it, **faithfully port prettier-plugin-svelte's print
logic** onto rsvelte's existing Doc IR.

## The spec (the oracle's actual program)

`node_modules/prettier-plugin-svelte/plugin.js` (readable CJS build, 4.1.0) — the
exact code oxfmt(`svelte:true`) runs. Port these:

- `printChildren` (≈1870) + `printChild`/`handleTextChild`/`handleBlockChild`/
  `handleInlineChild` (≈1906–1994) — the core child layout.
- The element case of `print` (≈1059–1257) — open-tag group, and the four
  assembly cases by `shouldHugStart`/`shouldHugEnd`.
- Helpers: `isInlineElement` (529), `isBlockElement` (535), `getChildren` (555),
  `trimChildren` (752), `shouldHugStart` (774), `shouldHugEnd` (801),
  `canOmitSoftlineBeforeClosingTag` (≈1193), the `blockElements` list (77–111,
  33 names), `isPreTagContent` (dynamic `<pre>`/`<textarea>`/`<script>`/`<style>`
  ancestor check).

Doc primitives the layout relies on: `group`, `indent`, `dedent`, `softline`,
`line`, `hardline`, `fill`, `breakParent`, `literalline`.

## Milestones (each validatable: `node scripts/compat-corpus/fmt.mjs --actual && node scripts/compat-corpus/fmt-verify.mjs`, 0 regressions)

0. **Extend `doc.rs`** — add `Dedent`, `BreakParent`, `Literalline`, `ForcedGroup`
   variants; `fits()` arms (`BreakParent`/`Literalline` → not-fit, `Dedent` →
   indent-1); a `propagate_breaks` pre-pass (Group containing `BreakParent` →
   `ForcedGroup`). Unit-tested. **DONE.** Also landed (2026-06-28):
   `Doc::RawExpr { flat, broken }` — embeds an oxc-formatted interpolation
   (`{expr}`) into a measured Doc: `flat` (single-line) in `Flat` mode, the
   pre-broken `broken` lines (continuation reindented to the current level) in
   `Break` mode; `fits` measures it by `flat` width and it never forces a break.
   This is the primitive that lets an oxc-string expression participate in a
   `Fill`/`Group` (rsvelte formats embedded JS with oxc, not as a Doc, so the
   expression can't otherwise be measured in-place by the outer layout). Unit-tested
   (`raw_expr_*`). NOT yet wired into markup (see the style-value finding below).
1. **New `children.rs`** — faithful port of `printChildren` + the 4-case element
   assembly; `should_hug_start/end`, canonical `is_block_element` (the 33-name
   oracle list, replacing the two divergent lists in markup.rs/collapse.rs),
   `is_inline_element` (with `in_pre_context`), `can_omit_softline_before_closing_tag`.
   **DONE (unwired, unit-tested):** `printChildren` + `splitTextToDocs` + the
   whitespace predicates + the 33-name `BLOCK_ELEMENTS` list; and
   `build_element_doc` — the 4-case assembly (`should_hug_start/end`,
   `compute_no_hug_separators`) for the corpus config (supported language, not
   `<pre>`, `bracketSameLine = false` so `canOmitSoftlineBeforeClosingTag` is
   constant-false). `in_pre_context` / non-CSS `htmlWhitespaceSensitivity`
   branches are deferred to wiring. Still `#[allow(dead_code)]` — milestone 2
   wires it in and removes the attribute (validated at 0 corpus regressions).
2. **Wire `children.rs` into `collapse.rs`** — replace `try_fill_mixed` /
   `try_hug_mixed` / `try_break_content_tag_block` with `build_element_doc`;
   keep `try_collapse` only as the pure-text fast path; route fragment-level
   inline runs through `build_children_doc`.
3. **Hug-awareness in `indent.rs`** — thread `hug_start`/`hug_end` so the
   first/last child whitespace isn't re-indented when the content hugs the tag.
4. **`Doc::Dedent` in the open-tag doc** — trailing `>` lands at the outer column
   when an inline element with attributes wraps inside a fill.
5. **`breakParent` propagation** — run `propagate_breaks` so a block-element
   sibling forces the parent group to break (`forceBreakContent`).
6. **`Doc::Literalline` for `<pre>`/`<textarea>`** — verbatim path via
   `in_pre_context`.

## Finding (2026-06-28): style-value cases are CSS-aware, not a markup fill

The remaining `style:transform="translate({a}px, calc(-50% + {b}px))"` failures
(AxisY/AxisYRight) are NOT solvable with a generic whitespace-`fill` over the
attribute value. Traced from the raw source + oracle:

- The oracle breaks after `…px,` — the `translate(a, b)` **argument comma** — and
  keeps `calc(-50% + {b…}` together on the next line, with `{b}` breaking
  internally (oxc). A naive whitespace fill would instead break before `{b}`
  (the `+ {b}` separator), which is wrong.
- So oxfmt formats a `style` value **CSS-structure-aware** (it knows `translate`
  takes comma-separated args and `calc(...)` is one unit), interleaving the
  embedded `{expr}` mustaches. That is a CSS-value-with-interpolations formatter,
  a distinct subsystem from `printChildren`/markup fill — and likely needs the
  embedded JS as `Doc::RawExpr` atoms placed by a CSS-aware layout.

Implication for the port: target **prose / mixed text+element content fill**
(Cluster A, `printChildren`) first — that IS the generic whitespace fill the
milestones describe. The CSS-aware style-value path is a separate, later effort;
`Doc::RawExpr` is the right primitive for both, but the style path additionally
needs a CSS value tokenizer (split at CSS punctuation, not whitespace).

## Gotchas

- `isPreTagContent` is a dynamic ancestor walk — thread `in_pre_context`, don't
  use a static tag check.
- `SvelteBoundary` never hugs.
- Comments are opaque atoms in `printChildren` (no special case).
- Edit-overlap: `markup.rs` owns the open-tag span; `children.rs` must only edit
  `[open_tag_end, element_end)`.
- Idempotency: re-verify `format(format(x)) == format(x)` after milestone 2.
- `htmlWhitespaceSensitivity` is hardcoded to `'css'` (the corpus oracle default).
- Perf: keep the single re-parse already used by collapse; don't add another.

See `docs/corpus-fmt-remaining-work.md` for the live failure breakdown.

## Tracked follow-up: collapse re-parse count (perf)

The incremental burndown grew `collapse::collapse_pure_text_elements` into several
sequentially-gated passes (1, 1.5, 1.6, 1.7, 1.8, 1.9, 1.95, 2, 3). Each pass
re-parses the document only when it produced edits, so the typical file pays 1–3
parses, but a worst-case file that triggers every pass pays up to ~9 full
`parse()` calls, and `reformat_pre_inner` compounds this by recursively calling
`crate::format()` for `<pre>`/`<textarea>` bodies. This is the original "keep the
single re-parse" gotcha drifting under incremental pressure. It is **not** a
correctness problem (CI runs the full ~9,715-component corpus well within the
job timeout) but it is the natural place to reclaim formatter performance.

Recommended dedicated follow-up (do with a benchmark, not under burndown
pressure): replace the ad-hoc passes with a single `run_collapse_pass(result,
tree, collect_fn)` runner that re-parses at most once per *changed* pass and
ideally fuse the 1.x passes into one widened collection, and give
`reformat_pre_inner` an internal `format_inner` that skips the collapse cascade.
Add a worst-case re-parse-count assertion/bench so it can't silently regrow.
