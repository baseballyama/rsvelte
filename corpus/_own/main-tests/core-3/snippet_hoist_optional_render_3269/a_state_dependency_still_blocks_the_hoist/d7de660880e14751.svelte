<script>
	let flag = $state(true);
</script>
{#snippet outer()}{#snippet sn()}<i>{flag}</i>{/snippet}{@render sn?.()}{/snippet}{@render outer()}
