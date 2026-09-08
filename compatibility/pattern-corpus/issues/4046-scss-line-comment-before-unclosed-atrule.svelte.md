# `4046-scss-line-comment-before-unclosed-atrule.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

Upstream runs `read_body` to completion before `eat('</style', true)`, so the selector error at the slash precedes both the missing `;` further on and the missing closing tag. Ordering the structural checks first reports whichever of those the raw scan happens to reach.
