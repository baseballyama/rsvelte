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

{#if ghost}
	{@const m = String(ghost)}
	<iframe title="t" sandbox="a{($count ?? false) ? ' b' : ''}"></iframe>
{/if}
<p>{m}</p>
