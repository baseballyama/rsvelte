<script>
	export let rows = [];
	export let onpick = () => {};

	let el;

	function handle(event) {
		onpick(event);
	}
</script>

<div bind:this={el} on:click|once|preventDefault|stopPropagation={handle} on:keydown={handle}>
	<slot name="header" {rows}>fallback header</slot>
	{#each rows as row, i (row.id ?? i)}
		<slot {row} index={i} let:unused>row {i}</slot>
	{:else}
		<slot name="empty" />
	{/each}
</div>
<p>{el ? 1 : 0}</p>
