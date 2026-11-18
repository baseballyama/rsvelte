<script>
	let { row } = $props();
	let open = $state(true);
</script>
{#if open}{@render row()}{/if}