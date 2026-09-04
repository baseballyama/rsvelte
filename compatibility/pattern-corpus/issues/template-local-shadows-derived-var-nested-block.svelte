<!-- Same guard with the declaration one block deeper, so its scope and the function
     body's are not the same scope. -->
<script>
	let base = $state(1);
	let w = $derived(base);
</script>
<button onclick={() => { { var w = 0; w--; } base = (typeof w).length; }}></button>
{w}
