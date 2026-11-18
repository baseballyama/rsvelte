# `2186-nested-assignment-destructure.svelte`

**Issue:** [#2186](https://github.com/baseballyama/rsvelte/issues/2186)

A **nested** destructuring **assignment** — `extract_paths` recurses, so every leaf is one flat `$.set(b, $$value.a.b)` in a single IIFE (never a nested `$$value` IIFE), and every array pattern at any depth contributes an `$$array` helper emitted before the assignments
