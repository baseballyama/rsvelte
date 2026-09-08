---
'@rsvelte/language-server': patch
---

feat(language-server): document a CSS property completion from the vendored MDN data

A CSS property completion carried `` `<name>` CSS property `` as its
`documentation` — the same one-line stub the hover answered with, from the same
place: `known_css_properties.rs` is a list of names and nothing else. So one
data gap produced divergences in `textDocument/hover` and
`textDocument/completion` alike, and repairing only the hover would have left
the second emission site of one lookup behind.

`cssCompletion.js:244` and `cssHover.js:83` both render an entry through
`getEntryDescription`. Hover passes a third `settings` argument that completion
does not, so "the same function" is an assumption rather than a fact; driving
the official server for both on one document measures the two strings
**byte-identical**, which is what licenses one lookup serving both here.

The `markdown` flag is threaded to both call sites — an embedded `<style>` block
and a `style="…"` attribute value — so a client without markdown support gets
the description unrendered rather than a markdown body it cannot display. A
property the vendored data has no description for now carries no documentation
at all, rather than the name stub.

Two upstream fixtures stop being pinned divergences: `css-smoke-hover-normal`
and `css-smoke-hover-nested` were recorded as answering `none` where upstream
answers `some`, on the reason "rsvelte CSS hover does not provide
selector-specific hover" — which the selector hover in this same change makes
false. The manifest's known-difference count goes 57 → 55.

The selector hover now follows the client's hover `contentFormat` as well.
`CSSHover.convertContents` (`cssHover.js:125-147`) maps a `MarkedString[]`
through `c.value` when the client declares no markdown support, so official
answers a plain `"<h1>"` where a markdown client gets
`{language: "html", value: "<h1>"}`; rsvelte emitted the tagged form to both.
That divergence was unreachable while rsvelte answered a selector with `null` —
the ratchet recorded the whole response as mismatched and never compared inside
it — so it became visible only once the selector hover existed. Two
`differential:fixtures/css-smoke-hover-normal` entries retire, taking
`lsp-known-failures.json` from 24128 to 24126.
