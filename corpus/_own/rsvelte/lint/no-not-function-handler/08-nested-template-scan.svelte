<script>
	const wrap = `${`inner`}`;
	const decoy = 'x';
	function noop() {}
</script>

<button on:click={decoy}>1</button>
<button on:click={noop}>2</button>
<span>{wrap}</span>
