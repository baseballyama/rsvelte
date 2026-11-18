<script>
	let base = $state(1);
	let row = $derived(base + 1);
	let open = $state(true);
</script>
{#if open}{#snippet row()}<b>local</b>{/snippet}{@render row()}{/if}