<script>
	let x = $state();
	let c = $state(true);
</script>

<div contenteditable={c} bind:textContent={x}></div>
