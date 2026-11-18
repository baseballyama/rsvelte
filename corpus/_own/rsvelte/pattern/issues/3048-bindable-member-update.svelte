<script>
	let { p = $bindable() } = $props();
	function run() {
		p.a++;
		p.b += 1;
		--p.deep.c;
	}
</script>

<button onclick={run}>x</button>
<button onclick={() => { p.c++; }}>y</button>
