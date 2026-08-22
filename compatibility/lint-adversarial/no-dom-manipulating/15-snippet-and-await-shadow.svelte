<script>
	let el;
	const p = Promise.resolve(1);
</script>

<div bind:this={el}>a</div>

{#snippet row(el)}
	<button onclick={() => el.remove()}>snippet</button>
{/snippet}

{#await p then el}
	<button onclick={() => el.remove()}>await</button>
{/await}

{@render row(1)}
