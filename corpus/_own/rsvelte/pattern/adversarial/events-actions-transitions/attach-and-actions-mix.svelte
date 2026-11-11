<script>
	let el = $state(null);
	let n = $state(0);
	function grow(node, amt) {
		return { update(a) { node.dataset.amt = a; }, destroy() {} };
	}
	const attachment = (node) => {
		node.dataset.n = String(n);
		return () => delete node.dataset.n;
	};
</script>

<div bind:this={el} use:grow={n} {@attach attachment}>x</div>
<div {@attach (node) => { node.title = `${n}`; }} use:grow>y</div>
<button onclick={() => (n += 1)}>{n}</button>
