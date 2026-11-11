<script>
	export let n = 0
	function log() {}
	async function go() {
		if (n) { log() }
		await fetch('/a')
		n++
	}
</script>
<button on:click={go}>{n}</button>
