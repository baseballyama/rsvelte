# `3107-textarea-bind-fallback.svelte`

**Issue:** [#3107](https://github.com/baseballyama/rsvelte/issues/3107)

A `<textarea>` with a content binding dropped its own children for SSR, so the `else` branch that renders when the bound value is falsy came out empty. The output parses and the truthy path is right, so only output equality reports it
