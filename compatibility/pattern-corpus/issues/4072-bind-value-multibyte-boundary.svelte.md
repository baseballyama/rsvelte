# `4072-bind-value-multibyte-boundary.svelte`

**Issue:** [#4072](https://github.com/baseballyama/rsvelte/issues/4072)

A `bind:` whose value expression starts with a multi-byte identifier. svelte2tsx located the directive's `=` with `source[..=expr_start]` — an *inclusive* slice of a byte offset, so the cut fell one byte past the expression's start, inside its first char, and aborted `svelte-check` with SIGABRT. The reported file's astral padding is incidental: the inclusive range makes any multi-byte first char enough. The `as string` sibling is the TS-assertion arm, which reaches the same site through a different expression range. This file's subject is svelte2tsx, not compiled output — it is here because the shared manifest is what puts it in front of the svelte2tsx-parity gate.
