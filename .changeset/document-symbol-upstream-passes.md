---
'@rsvelte/language-server': patch
---

Run `getDocumentSymbols`' post-processing over tsgo's document symbols

`TypeScriptPlugin.getDocumentSymbols` rewrites and drops symbols after mapping
them back — a container the navigation tree's root owns becomes `script`, a
zero-length range, a `__sveltets_` name and a `$$_` local that is not an `$on`
callback are dropped, a generated constructor's `props` and a property that is
really an attribute are dropped, and `<function>` is renamed after its source.
None of that ran. The native outline also spelled "no container" as an absent
field where `vscode-html-languageservice` spells it `''`, and gave `<script>`
and `<style>` `Module` where every other element gets `Field`.
