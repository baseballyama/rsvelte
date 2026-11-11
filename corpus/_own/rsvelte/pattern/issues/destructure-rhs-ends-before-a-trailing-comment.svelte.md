# `destructure-rhs-ends-before-a-trailing-comment.svelte`

**Issue:** corpus residue

The client destructure scanner decided where a right-hand side ends by walking characters, and a comment's `}` / `)` / `;` counted as code — so `;[doc] = res` followed by a `/* } c */` line ended the value inside the comment. The trailing comment is also trimmed back off the spliced range, because leaving it in makes an identifier RHS spell something other than an identifier and flips `generate_destructure_iife`'s `should_cache`. A bare identifier is the discriminating shape: a member expression caches either way.
