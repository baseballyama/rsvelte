<script>
	import { fade } from 'svelte/transition';

	let duration = $state(200);
</script>

{#snippet banner()}
	<p transition:fade={{ duration }}>hi</p>
{/snippet}

{@render banner()}
