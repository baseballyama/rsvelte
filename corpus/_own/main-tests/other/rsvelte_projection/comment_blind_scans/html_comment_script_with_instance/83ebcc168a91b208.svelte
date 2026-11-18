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

<!-- <script>let hidden = 1;</script> -->

<button onclick={() => fire()}>go</button>
<p>{$count}</p>
<p>{ghost}</p>
