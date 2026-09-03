---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

A namespace reaches the public `parse()` AST with its name, its modifiers and a real `TSModuleBlock`.

`TSModuleDeclaration` carried only a span and a body: no `id`, no `declare`, no `global`, and the body was a `BlockStatement` spanning the whole declaration where acorn-typescript emits a `TSModuleBlock` spanning the braces. A dotted `namespace A.B { … }` — which acorn-typescript parses as `A` whose body is `B` — was flattened into a block holding one statement.

The binary `parseEnvelope` format carries the same three fields and a new `TSModuleBlock` tag, so the Rust writer and the JS decoder that ship together in `@rsvelte/vite-plugin-svelte-native` stay in step.

The strip is unchanged in behaviour: it now walks through a nested declaration to the innermost block, so a non-type node is still rejected in the dotted form, which upstream cannot even reach (it reads `node.body.body` and throws a raw `TypeError`).
