<script>
	import { fade } from 'svelte/transition';

	let tag = $state('section');
	let active = $state(true);

	function log(node) {
		console.log(node.tagName);
	}
</script>

{#if active}
	<svelte:element
		this={tag}
		class:active
		style:outline="1px solid"
		use:log
		transition:fade={{ duration: 100 }}
		onclick={() => (active = false)}
	>
		body
	</svelte:element>
{/if}
