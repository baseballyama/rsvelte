<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#snippet sn(v)}{v}{/snippet}{@render sn(b)}
