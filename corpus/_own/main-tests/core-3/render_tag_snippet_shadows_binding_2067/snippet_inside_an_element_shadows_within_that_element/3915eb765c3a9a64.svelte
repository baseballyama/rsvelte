<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}<div>{#snippet row()}<b>local</b>{/snippet}{@render row()}</div>{/if}