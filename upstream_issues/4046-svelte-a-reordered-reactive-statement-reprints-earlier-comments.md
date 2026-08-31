# A reordered `$:` statement rewinds esrap's comment cursor, so earlier comments are printed twice

svelte 5.56.10, client output, no dev flag.

```svelte
<script>
	import { onMount } from 'svelte';

	let a = 1;
	let b = 2;
	const handler = () => {};

	$: if (a > 0) {
		b = a;
	}

	onMount(() => {
		// c1
		a = 2;
		// c2
		a = 3;
	});
</script>

<svelte:window on:click={handler} />
{a}{b}
```

`// c1` and `// c2` appear twice in the generated module — once where the source
put them, and again as arguments of the synthesized `$.event(...)` call:

```js
	onMount(() => {
		// c1
		$.set(a, 2);

		// c2
		$.set(a, 3);
	});

	$.legacy_pre_effect(() => ($.get(a)), () => {
		if ($.get(a) > 0) {
			$.set(b, $.get(a));
		}
	});

	$.legacy_pre_effect_reset();
	$.init();
	$.next();

	var text = $.text();

	$.event(
		'click',
		$.window,
		// c1
		// c2
		handler
	);
```

The second copy is not a comment about anything at that position: it sits
between `$.window` and the handler, inside an argument list the compiler
synthesized.

## Why it happens

`esrap`'s comment cursor (`comment_index`) only ever moves forward, except in
`reset_comment_index`, which `body()` calls with the enclosing node's
`loc.start`. A legacy `$:` statement is MOVED to the end of the instance body
while keeping its source `loc`, so printing its block calls
`reset_comment_index` with a position EARLIER than the statements already
printed — here line 8, before the `onMount` call on line 13. The cursor rewinds
to the first comment at or after that position, which is `// c1`. Nothing
consumes those comments again until the printer reaches a node that has a `loc`,
and the next one is the `handler` identifier inside the template's
`$.event(...)` — whose `loc` is in the markup, past both comments. The `_`
wildcard's `flush_comments_until(context, null, node.loc.start, true)` then
emits every pending comment before it.

The number of reprinted comments is therefore "every comment between the
reordered `$:` statement and the end of the instance script", and the position
they land at is the first template expression that kept a source `loc`.

## Where it shows up in real code

`sparrow-app`'s
`packages/@sparrow-workspaces/src/features/collection-list/components/collection/Collection.svelte`
reprints six comments this way (`// Call it once immediately`,
`// Set interval and save its ID`, `// isSyncChangesAvailable = true;`,
`// 2 minutes`, `// Optional: cleanup right here if component is destroyed`,
`// Clean-up to avoid memory leaks`) inside one
`$.event("click", $.window, handleSelectClick)`; its sibling
`.../folder/Folder.svelte` reprints a larger set. Counting comment texts on both
sides: of 89 distinct texts in the first file 11 differ in MULTIPLICITY, and of
87 in the second, 33. The majority shape is svelte emitting exactly one more
copy than rsvelte (`R:1 O:2` x4 and x20 respectively; `R:2 O:4`, `R:3 O:4`,
`R:4 O:5`, `R:7 O:10` account for the rest of the same direction). The `R:0`
rows in the same tables are a SEPARATE rsvelte defect — comments it drops at
their source position as well — and are not evidence for this report.

## Desired behaviour

A comment should be printed once. Either the reordered `$:` statement should not
rewind the cursor (it is emitted out of source order, so its `loc` is not a
position the print stream is at), or the rewind should not be allowed to move
`comment_index` backwards past comments that have already been emitted.

This is reported because rsvelte targets byte-identical output: reproducing it
means deliberately emitting a comment twice, which we would rather not encode if
upstream considers it a bug.
