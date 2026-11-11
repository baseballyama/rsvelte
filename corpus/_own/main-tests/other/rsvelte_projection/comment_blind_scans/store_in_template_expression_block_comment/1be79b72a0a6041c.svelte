<script>
	import { createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';

	const dispatch = createEventDispatcher();
	const count = writable(0);
	const ghost = 1;

	function fire() {
		dispatch('real');
	}
</script>

<button onclick={() => {
	/* reorder($ghost) */
	fire();
}}>go</button>
<p>{$count}</p>
