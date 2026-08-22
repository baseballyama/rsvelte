<script>
	import { writable } from 'svelte/store';
	export let count;
	const c = writable(0);
	$: $c = count;
	function bump() {
		$c++;
	}
</script>

<button on:click={bump}>{$c}</button>
