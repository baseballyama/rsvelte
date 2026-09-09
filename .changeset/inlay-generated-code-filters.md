---
"@rsvelte/language-server": patch
---

Apply `InlayHintProvider`'s generated-code filters to `textDocument/inlayHint`

`on_inlay_hint` forwarded tsgo's hints with no filter but the render-return-type one, so every
hint svelte2tsx's own scaffolding produces reached the editor. This ports the four AST filters
(`isSvelte2tsxFunctionHints`, `isGeneratedVariableTypeHint`, `isGeneratedAsyncFunctionReturnType`,
`isGeneratedFunctionReturnType`) plus `isInGeneratedCode`, applied in upstream's order and on
shadow offsets — the coordinate space upstream filters in, before any mapping.
