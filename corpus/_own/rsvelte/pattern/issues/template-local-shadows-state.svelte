<!-- Negative half of the axis: an outer `$state` is not folded, so the same written
     local must stay inert. Measured green on all three arms, all four targets. -->
<script>
	let base = $state(1);
	let v = $state(2);
</script>
<button onclick={() => { var v = 0; v--; base = (typeof v).length; }}></button>
{v}
