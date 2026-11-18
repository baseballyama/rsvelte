<script>
	function f(x) {
		return x;
	}
</script>

<svelte:element this={'div'} on:click={f()}>a</svelte:element>
<svelte:element this={'span'} on:click={f.bind(null, 1)}>b</svelte:element>
<svelte:element this={'p'} on:click={(f(1), f(2))}>c</svelte:element>
