<script module>
	let shared;
</script>

<script>
	import { onMount } from 'svelte';

	onMount(() => {
		shared.prepend('x');
	});
</script>

<div bind:this={shared}>a</div>
