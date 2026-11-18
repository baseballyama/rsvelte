<script>
	let models = null;
	function reload() { models = []; }
	function send(m) { return m; }
</script>
<button onclick={() => {
	try {
		send(models);
	} catch (e) {}
}}>{models}{reload}</button>
