---
"@rsvelte/language-server": patch
---

fix(lsp): hide generated snippet functions from the document outline

Ports `svelte-language-server`'s `<function>` handling in `getDocumentSymbols`
(sveltejs/language-tools#3114): an anonymous function in tsgo's outline of a component is kept and
named after its source text only when it sits in a `<script>` or inside a function expression the
user wrote in the template; the functions svelte2tsx generates for snippets and for the template
callback that replaces the instance script's end tag are dropped. The outline's other passes ran
over `SymbolInformation` alone, so a client with `hierarchicalDocumentSymbolSupport` — which is
the shape tsgo then answers with — got none of them; they now read `range` as well as
`location.range`, and a dropped nested symbol leaves its children in its place.
