<script>
	let flag = $state(true);
</script>
{#snippet outer()}{#snippet sn()}<i>x</i>{/snippet}{@render sn?.()}{/snippet}{@render outer()}
