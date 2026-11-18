# `reactive-hoist-declarator-comment.svelte`

**Issue:** corpus residue

The hoisted `let p, q;` that legacy `$:` declarations build is printed FIRST, so each declarator is the flush point for every comment written before its source position. Its anchor was registered when the statement was COLLECTED — ahead of that statement's own leading region — so the comment leading `$: p = …` printed before `q`, one name late. Two declaring statements each with a comment is the discriminating shape: one anchor off by one moves exactly one comment, and a single-comment file cannot tell the two rules apart. The `// A` here also pins that upstream prints it TWICE (hoist and statement), which rsvelte reproduces.
