<script>
	import Comp from './Comp.svelte';
	let foo = $state('foo');
	const p = Promise.resolve('v');
</script>

<div style:color={(await p) + foo}></div>