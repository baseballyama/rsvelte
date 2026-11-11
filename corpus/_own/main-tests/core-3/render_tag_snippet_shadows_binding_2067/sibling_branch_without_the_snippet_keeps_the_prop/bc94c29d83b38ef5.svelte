<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}{#snippet row()}<b>local</b>{/snippet}{@render row()}{:else}{@render row()}{/if}