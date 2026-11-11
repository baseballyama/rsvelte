<script>
	let models = null;
	function reload() { models = []; }
	function send(m) { return m; }
</script>
<button onclick={() => {
	try {} catch (models) {
		send(models);
	}
}}>{models}{reload}</button>
