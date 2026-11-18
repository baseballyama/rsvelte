<script>
	let n = $state(0);
	const String = (v) => v + n;
</script>
{#if true}{@const c = String("A")}{c}{/if}
