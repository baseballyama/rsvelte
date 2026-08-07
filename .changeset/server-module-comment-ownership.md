---
'@rsvelte/compiler': patch
---

fix: drop the comments a server `.svelte.(js|ts)` module's top level cannot own.
`server_module` assembled its output as text and emitted the transformed script
verbatim, so every source comment survived — including the `/* @__PURE__ */` an
esbuild TS strip leaves on a default-parameter initializer. It now goes through
the same builder-made, `loc`-less program the client module path already used,
so esrap's comment cursor is parked past the end and only a nested body that
carries a location re-finds its own: a file header, a comment between two
top-level statements and a comment leading an arrow's expression body are
dropped, while comments inside a function, arrow-block, class or nested block
body survive.
