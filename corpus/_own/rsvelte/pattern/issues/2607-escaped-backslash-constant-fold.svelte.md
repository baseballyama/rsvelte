# `2607-escaped-backslash-constant-fold.svelte`

**Issue:** [#2607](https://github.com/baseballyama/rsvelte/issues/2607)

A known-const `'\\'` folded into an element's `textContent`. The fold read the initializer's **source text** and left every non-codepoint escape undecoded, so the emitter escaped it a second time and the component rendered two backslashes. Output is valid JavaScript computing the wrong string — the parse gate is blind to it, and it diverged on client, server **and** client-dev
