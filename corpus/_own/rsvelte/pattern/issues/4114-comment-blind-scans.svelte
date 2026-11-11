<script>
	import { createEventDispatcher } from 'svelte';
	import { writable } from 'svelte/store';

	const dispatch = createEventDispatcher();
	const count = writable(0);
	const ghost = 1;

	// dispatch('line-commented')
	/* dispatch('block-commented') */
	/**
	 * dispatch('jsdoc-commented')
	 */
	const label = "dispatch('stringy')";

	function fire() {
		dispatch('real');
	}
</script>

<!-- <script>let hidden = 1;</script> -->

<button
	onclick={() => {
		const note = `$ghost and dispatch('nested')`;
		fire();
		return note;
	}}
>
	go
</button>
<p>{label}</p>
<p>{$count}</p>
<p>{ghost}</p>
