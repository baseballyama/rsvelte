<script>
	let d = $state(1);
	function make() {
		return () => d++;
	}
</script>
<button on:click={make()}>{d}</button>
<input on:input={make()} use:action value={d} />
