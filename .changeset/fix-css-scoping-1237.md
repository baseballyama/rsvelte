---
"@rsvelte/compiler": patch
---

fix(compiler/css): correct three selector scoping/pruning divergences (#1237)

Three CSS divergences from the official compiler surfaced by the awesome-svelte
compat corpus (svar-core, svelte-toast), now byte-identical for client and server:

- **Sibling-combinator over-prune.** `.wx-icon + .wx-label` was commented out as
  unused when the `.wx-icon` element carried a dynamic class
  (`class="wx-icon {expr}"`) — the static `wx-icon` chunk dropped out of the
  element's class set on bail-out. `selector_matches_element` now treats an
  element with an indeterminate `class` (interpolated expression or spread) as
  matching any class selector, mirroring upstream `attribute_matches`.
- **Multi-line `:global( … )` whitespace.** The unwrap now slices `:global(`.end
  up to the byte before the closing `)` (matching upstream
  `remove_global_pseudo_class`), preserving the inner padding instead of using
  the tight `args` SelectorList span.
- **`<style>` inside a `<script>` template literal.** A `<style>` substring in a
  script string literal (a docs page rendering a Svelte sample) was mistaken for
  the real stylesheet. `render_stylesheet` / `collect_css_unused_warnings` now
  prefer the parsed stylesheet's recorded `content` span over a textual scan.
