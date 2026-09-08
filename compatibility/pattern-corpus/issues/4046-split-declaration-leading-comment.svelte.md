# `4046-split-declaration-leading-comment.svelte`

**Issue:** corpus residue

Upstream rebuilds a multi-declarator declaration as one statement per declarator, so the statement carries no `loc` and esrap flushes its own-line leading comments at the declarator — after the keyword. A comment trailing the previous statement's line stays with that statement, and an exported declaration is left alone because the prop lowering re-emits it.
