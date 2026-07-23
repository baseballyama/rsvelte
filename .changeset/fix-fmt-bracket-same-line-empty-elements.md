---
"@rsvelte/fmt": patch
---

fix(fmt): match prettier for two `bracketSameLine` empty/whitespace element cases

Under `bracketSameLine: true` two residual divergences from prettier-plugin-svelte
are fixed (both pre-existing, no effect on the default `false`):

- a deliberate whitespace-only inline element in prose (`<p>text <span>   </span>
  text</p>`) now keeps prettier's non-hug body (`<span> </span>`) instead of
  collapsing to the source-empty hug form — the source whitespace is told apart
  from the wrap artifact an earlier pass inserts into source-empty wrapped
  elements;
- a standalone source-empty element with a long wrapping open tag (a block
  element's lone `<span class="…long…"></span>`) now dedents its `>` onto its own
  line and glues `></span>` (applying `canOmitSoftlineBeforeClosingTag`) instead
  of gluing the `>` to the last attribute and dangling `</span>`.
