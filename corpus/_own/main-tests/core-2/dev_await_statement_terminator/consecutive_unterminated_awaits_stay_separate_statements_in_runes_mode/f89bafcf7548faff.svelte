<script>
	let n = $state(0)
	async function go() {
		await fetch('/a')
		await fetch('/b')
		n++
	}
</script>
<button onclick={go}>{n}</button>
