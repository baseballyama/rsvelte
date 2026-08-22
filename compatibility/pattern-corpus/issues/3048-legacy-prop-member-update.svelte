<script>
	export let p;
	function run() {
		p.a++;
		p.b += 1;
	}
</script>

<button on:click={run}>x</button>
