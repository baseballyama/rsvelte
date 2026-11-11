<script>
	import Comp from './Comp.svelte';
	let o = $state({});
	let obj = {};
</script>
<input bind:group={o.x} />