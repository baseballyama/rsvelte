# `prop-shadowed-by-local-in-instance-script.svelte`

**Issue:** corpus residue

`validate_mutation` resolves the write target through `scope.get`, so a `for (const filter of …)` binding or a destructured arrow parameter that shadows a prop is not a prop write at all. rsvelte matched the root by NAME, so both shapes became `filter(filter().group = …, true)` on `client` and gained an ownership wrap on `client-dev`. The second prop written from an unshadowed position is the positive control.
