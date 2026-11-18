<script>
	import Comp from './Comp.svelte';
	let foo = $state('foo');
	const p = Promise.resolve('v');
</script>

<Comp {...{ x: (await p) + foo }} />