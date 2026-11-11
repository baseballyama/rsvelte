<script>
	const w = window.innerWidth;
	document.title = 'top level';
	function safe() {
		return document.body;
	}
	const lazy = () => location.href;
	void [w, safe, lazy];
</script>
<p>basic</p>
