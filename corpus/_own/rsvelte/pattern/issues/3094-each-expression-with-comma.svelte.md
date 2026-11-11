# `3094-each-expression-with-comma.svelte`

**Issue:** [#3094](https://github.com/baseballyama/rsvelte/issues/3094)

svelte2tsx must wrap an `{#each}` collection in parens when its **source text** contains a comma, so `for (const x of true, [1, 2])` cannot form; upstream decides with a plain `String.includes(',')`, so a call's argument list triggers it too. The file crosses that with the array-and-item-same-name shape, which takes the `$$_each` temp-var branch
