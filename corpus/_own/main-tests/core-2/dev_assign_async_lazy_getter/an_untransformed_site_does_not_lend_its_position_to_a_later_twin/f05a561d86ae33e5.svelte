<script>
	let { opacity = 0.5 } = $props();

	const fixed = (node) => node.style.opacity = 0.5;

	const unknown = (node) => node.style.opacity = opacity;
</script>
