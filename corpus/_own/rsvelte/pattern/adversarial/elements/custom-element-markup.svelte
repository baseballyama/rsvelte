<script>
	let level = $state(3);

	function onthing(e) {
		level = e.detail;
	}
</script>

<my-widget power-level={level} config={{ mode: 'deep' }} onlevel-change={onthing}>
	<span slot="icon">i</span>
	light dom
</my-widget>

<another-el bind:this={window.__el} hidden={level > 5}></another-el>
