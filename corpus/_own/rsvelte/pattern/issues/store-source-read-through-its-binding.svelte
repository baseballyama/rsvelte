<script>
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	export let propStore;

	let ctxStore = getContext('k');

	if (!ctxStore) {
		ctxStore = writable({});
		setContext('k', ctxStore);
	}

	const constStore = writable({});

	// The store SOURCE each of these mutations passes to `$.store_mutate` is
	// read through its own binding: `ctxStore` is reassigned above so it is a
	// `$.mutable_source` and reads as `$.get(ctxStore)`; `propStore` reads as
	// the getter call `propStore()`; `constStore` reads as its bare name.
	$: $ctxStore.a = 1;
	$: $propStore.a = 2;
	$: $constStore.a = 3;

	// A store ASSIGNMENT reaches a different port of the same upstream decision
	// (`store_assign_ast`), which already had all three arms. It is pinned in
	// `store_mutate_source_read.rs` rather than here: `$: $s = …` AFTER a
	// `$: $s.x = …` also reorders the two statements in the SERVER output, an
	// unrelated defect that would make this repro diverge for the wrong reason.
	$: $ctxStore, 0;
</script>

{$ctxStore.a}{$propStore.a}{$constStore.a}
