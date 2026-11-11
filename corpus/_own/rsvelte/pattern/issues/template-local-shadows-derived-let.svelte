<!-- Same write through `let`, which does not hoist: the keyword is not the axis. -->
<script>
	let base = $state(1);
	let v = $derived(base);
</script>
<button onclick={() => { { let v = 0; v--; } base = (typeof v).length; }}></button>
{v}
