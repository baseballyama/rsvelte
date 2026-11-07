<script>
	const obj = {
		'a()': (node) => node.textContent = 'Success'
	}
</script>

<div use:obj.a() />
<!-- It actually works. -->
<!-- Treats it as a compile error, as it shouldn't have been intended by the user. -->

<!-- https://svelte.dev/repl/00d48f7d8e504f488fb8148de74f9ca4?version=3.52.0 -->
