---
"@rsvelte/compiler": patch
---

fix(transform): keep a brace-less control-flow body with its `$:` header

The legacy instance-script statement splitter treated a depth-0 newline after a
brace-less control-flow header (`$: if (cond)`, `else`, `for (...)`, `while (...)`,
`do`) as a statement boundary. So

```svelte
$: if (object3d)
	if$_instance_change(object3d, …)
```

split the body off as a separate top-level statement: rsvelte emitted the call
eagerly and unguarded at component setup, and lowered the header to an empty
reactive effect (`if (object3d());`) instead of
`$.legacy_pre_effect(…, () => { if (object3d()) if$_instance_change(…); })`.

Treat a statement whose accumulated text ends with a brace-less control header as
incomplete (like a trailing binary operator), so its following body statement is
accumulated with it. Add `ends_with_braceless_control_header` (word-boundary
keyword match + backward paren match) to `expression_utils`, applied in both the
line-accumulation boundary check and `find_statement_end_client`. Removes
`svelthree/src/lib/components/Object3D.svelte` from known-failures.client.json.
