# `3336-parenthesised-effect.svelte.js`

**Issue:** [#3336](https://github.com/baseballyama/rsvelte/issues/3336)

A parenthesised `$effect(…)` / `$effect.pre(…)` statement in a **server module**, whose removal is a text scan that cut the call out of its own parentheses and left `();` behind. The component instance script takes the AST path instead, so only a module pins this one
