<script>
	let items = [1];
	let p = Promise.resolve(1);
</script>

{#each items as item}
	<div style="color: red">{item}</div>
{/each}
{#await p then v}
	<div style:color="red">{v}</div>
{/await}
{#if items.length}
	<div style="">empty</div>
{/if}
