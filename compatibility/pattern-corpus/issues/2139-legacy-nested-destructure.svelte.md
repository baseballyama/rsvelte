# `2139-legacy-nested-destructure.svelte`

**Issue:** [#2139](https://github.com/baseballyama/rsvelte/issues/2139)

A **nested** legacy destructuring declaration — `extract_paths` recurses, so a nested state leaf still gets its `$.mutable_source` (and dev `$.tag`) and every nested array pattern gets its own `$$array` helper
