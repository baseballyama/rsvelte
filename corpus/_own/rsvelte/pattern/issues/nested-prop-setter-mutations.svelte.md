# `nested-prop-setter-mutations.svelte`

**Issue:** corpus residue

A dev ownership-validation wrapper around a legacy prop setter whose async right-hand side contains more setters for the same prop. The AST rewrite must compose the nested replacements before splicing the outer replacement; overlapping source offsets otherwise corrupt the generated JavaScript.
