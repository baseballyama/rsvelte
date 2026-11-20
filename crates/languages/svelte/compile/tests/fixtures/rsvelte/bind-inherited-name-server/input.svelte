<script>
	let x = $state();
</script>

<svelte:window bind:constructor={x} />
<div bind:toString={x}></div>
<svg bind:valueOf={x}></svg>
