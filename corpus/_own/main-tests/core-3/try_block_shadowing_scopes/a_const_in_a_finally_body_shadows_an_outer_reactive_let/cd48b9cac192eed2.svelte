<script>
	let models = null;
	function reload() { models = []; }
	function send(m) { return m; }
</script>
<button onclick={() => {
	try {} finally {
		const models = [1];
		send(models);
	}
}}>{models}{reload}</button>
