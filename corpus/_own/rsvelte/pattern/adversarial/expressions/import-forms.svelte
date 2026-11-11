<script module>
	export const meta = import.meta.url;
</script>

<script>
	import { onMount } from 'svelte';
	import * as everything from 'svelte';
	import Default, { tick as renamed } from 'svelte';

	let loaded = $state('');

	onMount(async () => {
		const mod = await import('svelte');
		await renamed();
		loaded = typeof mod + typeof everything + typeof Default;
	});
</script>

<p>{loaded}{meta}</p>
