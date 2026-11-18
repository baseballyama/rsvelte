<script>
	import Comp from './Comp.svelte';
	let foo = $state('foo');
	const p = Promise.resolve('v');
</script>

<div data-x={(await p) + foo}></div>