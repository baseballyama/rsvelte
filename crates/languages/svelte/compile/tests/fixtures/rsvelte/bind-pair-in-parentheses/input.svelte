<script>
	let v = $state(1);
</script>

<input bind:value={/* c */ (() => v, (x) => (v = x))} />
