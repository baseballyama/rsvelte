<script>
	import C from './C.svelte';
	let { color = 'red', Dyn } = $props();
	let n = $state(1);
</script>
<C --color={color} --size="2px" a={1} />
<svg><C --fill="blue" --w={n} /></svg>
<Dyn --x="1"><p>child</p></Dyn>
<svelte:component this={Dyn} --y={n} />
