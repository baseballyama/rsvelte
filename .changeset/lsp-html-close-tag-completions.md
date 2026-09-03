---
'@rsvelte/language-server': minor
---

`textDocument/completion` offers HTML close tags.

`tag_prefix` excluded a `/` prefix outright, so every `</` position answered with nothing
while the official server answers with `collectCloseTagSuggestions`
(`vscode-html-languageservice`). Measured on 29 documents against both servers, rsvelte
emitted zero `/`-prefixed items in all of them.

The rule has two branches whose `filterText` disagree about the `>`, so each is the other's
negative control: with a still-open ancestor whose line indent differs from the cursor's,
the edit replaces the whole line prefix and filters on `<indent></tag`; otherwise it
replaces from the `/` and filters on `/tag`. With no ancestor the whole tag table is
offered and the filter carries the `>`.

The ancestor's name comes from the document, not the tag data, because a component and a
`svelte:` element are ancestors the provider does not list — only the no-ancestor fallback
reads it. An ancestor stops being one when its end tag begins before the cursor, so a fully
typed `</div>` falls back to the tag table rather than offering `/div`.
