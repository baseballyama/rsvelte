<script>
	let models = null;
	function reload() { models = []; }
	function send(m) { return m; }
</script>
<button onclick={() => {
	try {
		const models = [1];
		send(models);
	} catch (e) {}
}}>{models}{reload}</button>
