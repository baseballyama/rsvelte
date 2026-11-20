<script>
	let x = $state();
	let ty = $state('checkbox');
</script>

<input type={ty} bind:checked={x} />
