---
"@rsvelte/svelte2tsx": patch
---

Keep one line break behind when svelte2tsx hoists a type or interface declaration above `$$render`. The whole chunk including its leading blank lines was moving, so every statement after it sat a line higher in the TSX than in official's output.
