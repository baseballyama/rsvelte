<script>
	import { writable } from 'svelte/store';

	const store = writable({});

	export let prop = {};
	let state = {};

	// Upstream walks a default value with the same `AssignmentExpression` and
	// `UpdateExpression` visitors as any other expression, so each of these
	// writes is lowered exactly as it would be in the instance body. rsvelte
	// reaches a default through passes that skip a line containing `$.prop(`,
	// and the prop and store WRITE halves had no default-scoped counterpart:
	// `$store = 1` came out as `$store() = 1`, which no JS parser accepts.
	export let writeProp = () => (prop = 1);
	export let updateProp = () => prop++;
	export let mutateProp = () => (prop.x = 1);

	export let writeStore = () => ($store = 1);
	export let updateStore = () => $store++;
	export let mutateStore = () => ($store.x = 1);

	// The control: state already reached its own pipeline inside a default, so
	// these three are unchanged by the fix and separate "the two missing passes"
	// from "default values as a category".
	export let writeState = () => (state = 1);
	export let updateState = () => state++;
	export let mutateState = () => (state.x = 1);

	// A bare identifier default is passed as a getter REFERENCE, so no pass may
	// rewrite it. This is why the write passes are guarded on "not a bare
	// identifier" rather than on "an arrow": upstream wraps every other shape in
	// `() =>` itself.
	export let bareStore = $store;
</script>

{writeProp}{updateProp}{mutateProp}
{writeStore}{updateStore}{mutateStore}
{writeState}{updateState}{mutateState}
{bareStore}
