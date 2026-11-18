<script>
	let list;

	function go() {
		list.normalize();
		list.append('x');
		list.item(0);
		list.querySelector('a');
		const fn = list.remove;
		return fn;
	}
</script>

<ul bind:this={list}>a</ul>
<button on:click={go}>x</button>
