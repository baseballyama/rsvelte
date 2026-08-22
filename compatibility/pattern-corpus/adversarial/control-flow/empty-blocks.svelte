<script>
	let x = $state(1);
	let items = $state([1]);
</script>

{#if x}{/if}
{#if x}{:else}{/if}
{#each items as it}{/each}
{#key x}{/key}

{#snippet nothing()}{/snippet}
{@render nothing()}

<svelte:head></svelte:head>

<div></div>
<span> </span>
<p>{x}{items.length}</p>
