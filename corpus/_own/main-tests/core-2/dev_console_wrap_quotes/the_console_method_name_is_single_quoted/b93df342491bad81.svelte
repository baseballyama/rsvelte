<script>
	export let value;
	function go() {
		console.error(`v ${value}`, { value });
	}
</script>
<button on:click={go}>go</button>
