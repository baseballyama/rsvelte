<script>
	// Icons
	import { onMount } from 'svelte';
	// @ts-ignore
	import { tick } from 'svelte';

	// Props
	let a = 1,
		b = 2;

	onMount(() => tick());
</script>

{a}{b}
