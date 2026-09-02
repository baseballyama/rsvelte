<script>
	import { writable } from 'svelte/store';

	const store = writable({});

	let state = {};

	// The control for its co-resident sibling. These four defaults reach passes
	// that were already correct, so this file is EQ on every arm — including the
	// arms where the sibling diverges. One unparseable fragment makes the client
	// printer fall back for the WHOLE program (`CLIENT_TO_OXC_FALLBACK
	// chunk-parse`), so a broken declaration silently reformats its neighbours;
	// keeping the two files apart is what says the neighbours are not themselves
	// wrong.
	export let writeState = () => (state = 1);
	export let updateState = () => state++;
	export let mutateState = () => (state.x = 1);

	export let bareStore = $store;
</script>

{writeState}{updateState}{mutateState}
{bareStore}
