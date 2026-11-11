<script>
	import { createEventDispatcher, beforeUpdate, afterUpdate } from 'svelte';

	export let value = 0;

	const dispatch = createEventDispatcher();
	let previous;

	beforeUpdate(() => {
		previous = value;
	});

	afterUpdate(() => {
		if (previous !== value) dispatch('change', { from: previous, to: value });
	});

	function fire() {
		if (dispatch('pick', value, { cancelable: true })) {
			value += 1;
		}
	}
</script>

<button on:click={fire}>{value}</button>
