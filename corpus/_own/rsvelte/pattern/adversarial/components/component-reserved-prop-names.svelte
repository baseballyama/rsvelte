<script>
	import Child from './Child.svelte';

	let v = $state(0);
</script>

<Child
	class="c"
	for="f"
	default={1}
	function={2}
	new={3}
	typeof={4}
	in={5}
	delete={6}
	null={7}
	true={8}
	this={9}
	data-x="d"
	aria-label="a"
/>
<button onclick={() => v++}>{v}</button>
