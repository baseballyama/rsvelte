# `leading-block-comment-loses-its-dedent.svelte`

**Issue:** corpus residue

Upstream dedents a multi-line block comment by its opener line's indentation (`onComment`, `1-parse/acorn.js`). The client formatter receives the instance script with its first line's indentation already trimmed, so a comment opening on that line dedented by nothing and its continuation lines carried the source indent on top of the emitted one — and the chunk's opener line, having no indent, could not have one dedented back off it at the final print either, so the emitted indent was doubled as well. Both halves are needed: ablating either one alone reproduces the divergence. The second comment is the control — its opener line kept its indentation, so a fix that dedents unconditionally would strip a level too many there.
