---
"@rsvelte/compiler": patch
---

Keep the comments a removed statement used to swallow in `generate: 'server'` output

A statement the server transform removes (`$effect`, `$effect.pre`, `$effect.root`,
`$inspect`) took the comments around and inside it with it:

```js
export function f(a) {
	// leading
	$effect(() => {
		// interior
		console.log(a);
	});

	console.log(2);
}
```

```js
// official          // rsvelte before
export function f(a) {
	// leading           // leading
	// interior
	console.log(2);      console.log(2);
}
```

Upstream removes the statement NODE and lets esrap's comment cursor flush the orphans
from the enclosing (located) body. rsvelte lost them through two different mechanisms,
which is why the two entry points failed differently — the `.svelte.js` module path
kept the leading comment and ate only the interior one, while a component instance
script ate both:

- **`compileModule`** deletes the effect as a **source range**, so anything inside the
  range goes with it. The removal now replays the range's own comments at the removal
  point, guarded so a `//` comment is only ever emitted where nothing else shares its
  line. All four range-based removals in that pipeline are covered — `$effect(`,
  `$effect.pre(`, statement-position `$effect.root(` and the post-transform
  `$.user_effect(` cleanup; the pipeline's other ten rewrite sites unwrap a call rather
  than delete user source.
- **the component path** registers a comment region per top-level statement and anchors
  it on what that statement emitted. A statement that emitted nothing left its region
  unreferenced, so the comments died with it. A dropped statement now carries its region
  forward to the next surviving statement instead, matching where upstream's cursor
  flushes them. A statement that emits only `EmptyStatement` sentinels (a removed
  `$inspect` prints `;;`) counts as emitting no anchor, since the carry-over refuses to
  rewrite a sentinel span.

Client and client-dev output is unchanged. A comment after the **last** top-level
statement is still dropped — there is no surviving statement to re-home onto, and
upstream flushes it at the end of the enclosing function body instead; that is tracked
separately.
