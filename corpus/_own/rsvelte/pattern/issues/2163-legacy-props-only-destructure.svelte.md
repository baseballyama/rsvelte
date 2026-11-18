# `2163-legacy-props-only-destructure.svelte`

**Issue:** [#2163](https://github.com/baseballyama/rsvelte/issues/2163)

A legacy destructuring **assignment** whose targets are *only* props, with no `$state` or store among them. It was not recognised as reactive at all — no prop-assignment call was emitted, where upstream routes each extracted path through the normal assignment lowering (`3-transform/shared/assignments.js`, `visit_assignment_expression`). The three functions hold the three pattern kinds — object, object-with-rest and array — because each is a separate extraction path
