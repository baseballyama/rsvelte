<script>
	let { a = '', type = /** @type {{a: number}} */ ({ x: 1 }) } = $props();
</script>
<button {type}>x</button>
