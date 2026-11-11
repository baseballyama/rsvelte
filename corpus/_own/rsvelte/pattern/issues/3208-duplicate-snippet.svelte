<script>
	let v = $state('V');
</script>

{#snippet s()}<b>{v}</b>{/snippet}
{#snippet s()}<i>{v}</i>{/snippet}
{@render s()}
