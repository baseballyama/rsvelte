<script>
	let live = $state({ n: 1, deep: { s: 'a' } });
	function log() {
		console.log($state.snapshot(live));
	}
</script>

<button onclick={log}>{JSON.stringify($state.snapshot(live.deep))}</button>
<p>{$state.snapshot(live).n}</p>
