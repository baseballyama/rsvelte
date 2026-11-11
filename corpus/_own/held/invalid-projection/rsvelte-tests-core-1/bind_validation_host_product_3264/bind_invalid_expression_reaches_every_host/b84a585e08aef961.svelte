<script>
	import C from './C.svelte';
	let el = $state(null);
	let v = $state('v');
	let tag = $state('div');
	let tag2 = $state('span');
	let o = $state({ k: 1 });
	let rest = $state({});
</script>
<div bind:clientWidth={o?.k}>x</div>