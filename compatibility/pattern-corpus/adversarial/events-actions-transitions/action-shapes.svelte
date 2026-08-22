<script>
	let n = $state(0);

	function full(node, param) {
		node.dataset.p = String(param);
		return {
			update(next) {
				node.dataset.p = String(next);
			},
			destroy() {}
		};
	}

	const destroyOnly = () => ({ destroy() {} });
	const bare = () => {};
	const factory = (mult) => (node) => {
		node.dataset.m = String(mult);
	};
	const obj = { act: full };
</script>

<div use:full={n}></div>
<div use:full={{ nested: n }}></div>
<div use:destroyOnly></div>
<div use:bare></div>
<div use:factory={2}></div>
<div use:obj.act={n}></div>
<div use:full={n} use:bare class:on={n > 0}></div>

<style>
	.on {
		color: red;
	}
</style>
