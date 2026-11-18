<script>
	let items = [1];
	let value = 'v';
	let active = true;
</script>

{#each items as item (item)}
	<input bind:value={value} />
{/each}
{#snippet row()}
	<div class:active={active}>x</div>
{/snippet}
{@render row()}
<svelte:boundary>
	<div class:active={active}>y</div>
</svelte:boundary>
