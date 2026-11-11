<script>
	let n = $state(0);
	function f(a) { return 'v'; }
</script>
<svelte:element this={'span'} title={f()}></svelte:element>
