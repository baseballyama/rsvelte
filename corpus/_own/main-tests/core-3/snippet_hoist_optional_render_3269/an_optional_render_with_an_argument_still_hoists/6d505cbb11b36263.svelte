<script>
	let flag = $state(true);
</script>
{#snippet outer()}{#snippet sn(v)}<i>{v}</i>{/snippet}{@render sn?.(1)}{/snippet}{@render outer()}
