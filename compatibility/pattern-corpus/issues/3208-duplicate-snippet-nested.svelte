<script>
	let v = $state('V');
</script>

{#snippet s()}<b>{v}</b>{/snippet}
{#if v}{#snippet s()}<i>{v}</i>{/snippet}{/if}
