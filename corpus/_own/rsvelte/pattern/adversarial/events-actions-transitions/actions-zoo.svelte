<script>
	let text = $state('hover me');

	function tooltip(node, content) {
		const update = (c) => node.setAttribute('title', c);
		update(content);
		return {
			update,
			destroy() {
				node.removeAttribute('title');
			},
		};
	}

	const noop = () => {};
</script>

<p use:tooltip={text}>with param</p>
<p use:tooltip={`computed ${text}`}>template param</p>
<p use:noop>bare-ish</p>
<p use:tooltip={text} use:noop>stacked</p>
