<script>
	let raw = $state('x');
	function get() {
		return raw.toUpperCase();
	}
	function set(v) {
		raw = v.toLowerCase();
	}
	let n = $state(0);
</script>

<input bind:value={get, set} />
<input bind:value={() => raw, (v) => (raw = v)} />
<input type="checkbox" bind:checked={() => n > 0, (v) => (n = v ? 1 : 0)} />
<p>{raw}{n}</p>
