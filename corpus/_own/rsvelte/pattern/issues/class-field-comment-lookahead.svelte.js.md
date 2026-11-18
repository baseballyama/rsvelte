# `class-field-comment-lookahead.svelte.js`

**Issue:** mutation ratchet

The comment variant of #2929. The fix for that issue decides whether `id =` opens a multi-line conditional by reading the next two non-empty lines and asking whether one starts with `?` — but a comment is not a token, so a comment line between the `=` and the `?` pushes the `?` out of that two-line window. The field is then emitted alone and the emitter appends a `;`, giving `id =;` with both arms of the ternary orphaned: output no JS parser accepts. The comment's contents are irrelevant (unlike the chain-collapse defect, it is counted, not read), and the class must also carry a rune field, which is what makes the server run its class-field rewrite at all. Server only — the client matches official on every cell.
