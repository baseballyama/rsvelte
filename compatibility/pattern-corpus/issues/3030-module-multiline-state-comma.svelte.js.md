# `3030-module-multiline-state-comma.svelte.js`

**Issue:** [#3030](https://github.com/baseballyama/rsvelte/issues/3030)

A multiline class-field `$state(…)` whose argument list carries a **trailing comma** — the SSR unwrap kept the comma and appended the field's `;`, emitting `,;` (not JavaScript)
