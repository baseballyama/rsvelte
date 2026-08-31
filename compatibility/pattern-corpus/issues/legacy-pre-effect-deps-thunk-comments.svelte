<script>
	export let searchData = false;
	let expand = false;

	$: expand = !searchData;

	// The reactive statement is APPENDED after the rest of the instance body,
	// so a script-tail comment run sits before the generated
	// `$.legacy_pre_effect(...)` in the text rsvelte re-parses. Upstream's
	// dependency thunk is `b.thunk(b.sequence(deps))` and carries no `loc`, so
	// its comment cursor never flushes there.
	// const unsub = store.subscribe((v) => {
	//   expand = v;
	// });

	function f() {
		// The control: a located body still prints its own comment.
		return 1;
	}

	// $: {
	//   if (opened) {
	//     expand = true;
	//   }
	// }
</script>

<div>{expand}{f()}</div>
