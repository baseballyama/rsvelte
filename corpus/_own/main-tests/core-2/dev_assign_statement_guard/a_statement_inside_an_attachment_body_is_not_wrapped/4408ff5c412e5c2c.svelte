<script>
	let color = $state('red');
</script>

<canvas {@attach (node) => {
	const context = node.getContext('2d');
	context.fillStyle = color;
}}></canvas>
