---
"@rsvelte/compiler": patch
---

Stop a `@keyframes` rule inside a `:global { … }` block from scoping the component. Upstream's prune walker visits only such a rule's prelude, so nothing in its body can mark an element used — rsvelte read a percentage step (`0%`) there and gave every element the scope class. The same block also kept the `-global-` prefix on the keyframes name, because its children were copied verbatim.
