<script>
	let n = $state(0);
	function f(a) { return 'v'; }
</script>
<svelte:element this={'i'} class:a={f(1)}><svelte:element this={'b'} class:x={f(2)}></svelte:element></svelte:element>
