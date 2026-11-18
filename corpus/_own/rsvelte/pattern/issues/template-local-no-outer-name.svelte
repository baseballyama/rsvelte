<!-- Negative half: no outer binding of this name, so nothing may be grafted.
     Measured green on all three arms, all four targets. -->
<script>
	let base = $state(1);
	let v = $derived(base);
</script>
<button onclick={() => { var zz = 0; zz--; base = (typeof zz).length; }}></button>
{v}
