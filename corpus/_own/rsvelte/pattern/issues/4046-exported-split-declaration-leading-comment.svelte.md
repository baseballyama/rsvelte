# `4046-exported-split-declaration-leading-comment.svelte`

**Issue:** corpus residue

esrap flushes a rebuilt statement's leading comments at the first LOCATED node inside it, and only a SPLIT declaration is rebuilt — so a two-declarator `export let` prints its comment after the keyword while a one-declarator one keeps the source statement's `loc` and prints it before. The prop lowering rebuilds the declaration from its own text, so it has to carry the moved comment rather than drop it. The SSR half is a second port with its own mechanism — a per-statement comment region collapsed onto one address — and answers the same question there. A comment sharing the declarator's line stays on it, which is the row that separates the rule from "move every declaration's comment".
