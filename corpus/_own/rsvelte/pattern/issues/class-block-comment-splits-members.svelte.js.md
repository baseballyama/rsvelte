# `class-block-comment-splits-members.svelte.js`

**Issue:** corpus residue

A multi-line `/* … */` inside a class body is one comment, not one member per line. Splitting on its continuation lines leaves the block above unterminated, so `private_class_assign_ast` silently skips every rewrite it owns — including the `??=` lowering of a private `$state.raw` field.
