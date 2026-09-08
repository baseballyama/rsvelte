# `removed-export-leading-comment.svelte`

**Issue:** corpus residue

A specifier-only `export { … }` in an instance script IS the prop declaration and never reaches the output, so upstream's cursor finds no node there and a comment written before it is still pending at the next statement — which, being a SPLIT declaration, prints it after the `let` along with its own. `declaration_split`'s backward walk required whitespace only, so it stopped at the removed statement. Two removed exports in a row are the discriminating shape: crossing one is not crossing every one, and the surviving-statement control is what keeps the rule from becoming "walk back over anything".
