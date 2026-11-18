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
	const note = `$ghost`;
	fire();
	return note;
}}>go</button>
<p>{$count}</p>
