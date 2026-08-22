<script>
	let node;
	const verb = 'remove';

	function go() {
		node['remove']();
		node[verb]();
	}
</script>

<div bind:this={node}>a</div>
<button on:click={go}>x</button>
