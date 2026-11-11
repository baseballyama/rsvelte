# `3401-svg-type-selector-case.svelte`

**Issue:** [#3401](https://github.com/baseballyama/rsvelte/issues/3401)

The same comparison reached through SVG's camelCase element names, where the wrong case is the *natural* spelling: `clippath` selects `<clipPath>` and `lineargradient` selects `<linearGradient>`. An ASCII-uppercase-only repro cannot tell a lowercase-both-sides fix from one that only uppercases the selector
