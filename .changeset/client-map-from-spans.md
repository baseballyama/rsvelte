---
"@rsvelte/compiler": patch
---

Carry the source position on the IR node instead of recovering it from the generated text. The component function's block now knows which `<script>` braces it stands for, a real source span survives the split coordinate space a comment-bearing script puts the printer in, an identifier's span travels into the read transform it is wrapped by (so a segment covers `foo`, not `foo()`), and a member expression's object keeps its span. Every script — not only a TypeScript one — projects its unchanged bytes back to the source. Measured on the 29 upstream sourcemap samples, the map the printer emits on its own now reproduces 439 of the 488 client segments the official compiler emits, against 239 before; two of the eleven text-matching enrichment passes are removed as a result.
