<script>
	let items = [1];
	let p = Promise.resolve(1);
</script>

{#each items as item}{[item]}{/each}
{#if items.length}{{ n: items.length }}{/if}
{#await p then v}{[v]}{/await}
{#key items}{() => items}{/key}
{#snippet s()}{[9]}{/snippet}
{@render s()}
<svelte:head><title>x {[1]}</title></svelte:head>
