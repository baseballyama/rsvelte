<script>
	import { writable } from 'svelte/store';
	const state = writable(0);
	export let count;
	let total;
	$: {
		total = count * 2;
	}
</script>

{$state}
{total}
