# `3048-legacy-prop-member-update.svelte`

**Issue:** [#3048](https://github.com/baseballyama/rsvelte/issues/3048)

The legacy half: `export let p` + `p.a++` reaches the member-mutate pass AFTER the prop-read rewrite has produced `p().a++`, so the update wrap must accept a `p()`-rooted chain, and the pass's `=`-presence early-out must also fire on `++`/`--`
