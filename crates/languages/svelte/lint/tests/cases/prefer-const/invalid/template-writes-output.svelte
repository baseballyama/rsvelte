<script>
	let a = 1;
	let b = 2;
	const c = 3;
</script>
<button onclick={() => (a = 2)}>{a}</button>
<input bind:value={b} />
{c}