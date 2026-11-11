# `3187-dollar-prefixed-still-rejected.svelte`

**Issue:** [#3187](https://github.com/baseballyama/rsvelte/issues/3187)

The control the exemption needs: `let $x` inside a function body, which runes mode must STILL reject and legacy mode accepts. The rejection used to come from the blanket check being fixed here; upstream raises it from the three declaration visitors instead, and those had never fired below the top level in rsvelte because they looked the binding up in the root scope. Widening the exemption without also fixing that lookup turns this file green on both sides
