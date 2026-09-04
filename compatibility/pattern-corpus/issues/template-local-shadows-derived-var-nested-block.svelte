<!-- The write one block deeper, so the declaration's scope is not the function body's. -->
<script>
	let base = $state(1);
	let v = $derived(base);
</script>
<button onclick={() => { { var v = 0; v--; } base = (typeof v).length; }}></button>
{v}
