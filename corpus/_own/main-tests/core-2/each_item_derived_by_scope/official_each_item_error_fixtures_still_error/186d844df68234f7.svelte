<script lang="ts">
	let array: Array<{ id: number; element: HTMLElement | null }> = $state([
		{ id: 1, element: null }
	]);
</script>

{#each array as { id, element } (id)}
	<input bind:this={element} />
{/each}
