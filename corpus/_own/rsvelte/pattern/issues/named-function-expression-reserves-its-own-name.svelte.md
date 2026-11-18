# `named-function-expression-reserves-its-own-name.svelte`

**Issue:** corpus residue

A named function expression's own identifier was dropped by both program converters (`id: null`), so the name reached neither `root.conflicts` nor any consumer of the serialized program. The prop-default repro above found it through one door; this one is the general shape — the expression is nested in an arrow body and touches no props.
