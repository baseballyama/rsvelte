<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}{#snippet row()}<b>local</b>{/snippet}<p title={typeof row}>x</p>{/if}