<script>
	function f(x) { return x; }
	let w = $state(0);
</script>

<svelte:window onclick={() => f(1)} bind:innerWidth={w} />
<svelte:document onkeydown={f} />
<svelte:body onclick={f} />
<svelte:element this={'div'} onclick={() => f(1)}>t</svelte:element>
