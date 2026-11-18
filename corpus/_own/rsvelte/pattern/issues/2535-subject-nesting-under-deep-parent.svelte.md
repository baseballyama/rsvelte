# `2535-subject-nesting-under-deep-parent.svelte`

**Issue:** [#2535](https://github.com/baseballyama/rsvelte/issues/2535)

`a { span { a:hover & { … } } }` — a **subject** `&` under a two-compound parent. The `&` constrains the subject itself, so one `<a>` satisfies both the parent's ancestor link and `a:hover`; splicing the parent into the chain demands two nested `<a>` and prunes a live rule. Three real svelte.dev components have this shape
