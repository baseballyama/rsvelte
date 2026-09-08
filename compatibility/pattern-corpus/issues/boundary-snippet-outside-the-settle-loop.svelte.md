# `boundary-snippet-outside-the-settle-loop.svelte`

**Issue:** corpus residue

A component that `bind:`s a child renders inside a `do { … } while (!$$settled)` loop, and upstream keeps every snippet declaration ahead of it (`___snippet`, `transform-server.js:180`). The boundary visitor builds its own `failed` declaration instead of going through the snippet visitor, so the name was never recorded and the function stayed inside `$$render_inner`. A component-local snippet and a module-hoisted one are the controls.
