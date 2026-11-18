<script>
	let n = $state(0);
	function f(a) { return 'v'; }
</script>
<div title={f(1)}><svelte:element this={'span'} class:x={f(2)}></svelte:element></div>
