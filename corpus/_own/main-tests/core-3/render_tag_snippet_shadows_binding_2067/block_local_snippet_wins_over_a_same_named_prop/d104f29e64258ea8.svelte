<script>
	let { row } = $props();
	let items = [1];
</script>
{#each items as item}{#snippet row()}<b>{item}</b>{/snippet}{@render row()}{/each}