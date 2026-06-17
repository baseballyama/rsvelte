---
"@rsvelte/svelte2tsx": patch
---

svelte2tsx output-parity corpus burndown (29 fixes): preserve comments inside
expression tags and between element-opener attributes, emit a `$$ComponentProps`
typedef for every `$props()` destructure, fix auto-closed-element closing braces,
hoist `{#snippet}` above sibling consts, lower `<slot>` inside
`<template shadowrootmode>` to `createSlot`, compile snippet rest params, and
tolerate instance-script JS that acorn accepts but OXC rejects (raw passthrough).
Defers `each_key_without_as` / `render_tag` / snippet-rest / `<textarea>` logic-block
checks from parse to analyze so svelte2tsx (parse-only) matches the official oracle.
