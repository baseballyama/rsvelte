<script>
	export let n = 0
	async function go() {
		await fetch('/a')
		await fetch('/b')
		n++
	}
</script>
<button on:click={go}>{n}</button>
