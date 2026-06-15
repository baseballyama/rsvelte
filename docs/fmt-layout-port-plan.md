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
   `ForcedGroup`). Unit-tested.
1. **New `children.rs`** — faithful port of `printChildren` + the 4-case element
   assembly; `should_hug_start/end`, canonical `is_block_element` (the 33-name
   oracle list, replacing the two divergent lists in markup.rs/collapse.rs),
   `is_inline_element` (with `in_pre_context`), `can_omit_softline_before_closing_tag`.
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
