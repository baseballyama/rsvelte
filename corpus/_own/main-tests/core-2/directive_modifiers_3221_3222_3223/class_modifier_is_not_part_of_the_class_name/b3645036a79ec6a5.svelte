<script>
	import Comp from './Comp.svelte';
	import { flip } from 'svelte/animate';
	let flag = true;
	let color = 'red';
	let items = [{ id: 1 }];
	function handler() {}
	function action() {}
</script>
<svelte:element this={'div'} class:on={flag}>x</svelte:element>