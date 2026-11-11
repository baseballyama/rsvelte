# `3457-empty-folded-ssr-chunk.svelte`

**Issue:** [#3457](https://github.com/baseballyama/rsvelte/issues/3457)

An SSR expression chunk that constant-folds to the empty string must remain a template and emit `$$renderer.push(\`\`)` after its adjacent `{@const}` is hoisted. Literal, concatenated and global-call initializers cover the production/dev folding paths; the client targets are controls.
