# `3167-each-key-literal-property.svelte`

**Issue:** [#3167](https://github.com/baseballyama/rsvelte/issues/3167)

The literal key appears twice — once as the key expression itself, where dropping it made the emitted key function throw, and once with an index key, where the same drop is silent because nothing reads the binding. The computed and identifier keys beside them are the two branches that were already right, and both must stay unchanged: the fix adds an arm rather than changing how a key is chosen
