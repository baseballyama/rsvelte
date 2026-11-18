<script>
	import Comp from './Comp.svelte';
	import { flip } from 'svelte/animate';
	let flag = true;
	let color = 'red';
	let items = [{ id: 1 }];
	function handler() {}
	function action() {}
</script>
<svelte:head><div style:color|nope={color}>x</div></svelte:head>