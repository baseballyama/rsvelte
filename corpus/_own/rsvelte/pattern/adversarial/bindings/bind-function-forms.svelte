<script>
	let raw = $state('');
	let checkedCount = $state(0);

	function get() {
		return raw.toUpperCase();
	}

	function set(v) {
		raw = v.toLowerCase();
	}
</script>

<input bind:value={get, set} />
<input bind:value={() => raw, (v) => (raw = v.trim())} />
<input type="checkbox" bind:checked={() => checkedCount > 0, (c) => (checkedCount = c ? 1 : 0)} />
<p>{raw}:{checkedCount}</p>
