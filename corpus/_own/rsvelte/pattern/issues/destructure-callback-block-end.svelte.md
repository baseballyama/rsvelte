# `destructure-callback-block-end.svelte`

**Issue:** [#3933](https://github.com/baseballyama/rsvelte/pull/3933)

Legacy destructuring assignments as the final statement in an arrow callback and as a parenthesized braceless `if` body. The accumulated statement continues through the callback's closing `}`, and absorbing the body's parentheses leaves the control header's closing `)` before it; both delimiters must classify the assignment as an expression statement, or the lowering appends `return res` / `return $$value` to its IIFE.
