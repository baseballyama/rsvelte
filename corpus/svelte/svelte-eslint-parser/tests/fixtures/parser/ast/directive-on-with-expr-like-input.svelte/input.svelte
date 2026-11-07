<script>
	import Inner from './Inner.svelte'
	const foo = { bar: () => alert('foo.bar') }
</script>

<Inner on:foo.bar/> <!-- bubble (not member) -->

<!-- https://svelte.dev/repl/d6f31e9c5b784f8bb6bc3abd2c7153a7?version=3.52.0 -->
