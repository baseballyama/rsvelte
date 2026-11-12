<script>
	let v = $state(1);
	const p = Promise.resolve(1);
</script>

<input bind:value={async () => await p, (nv) => (v = nv)} />
