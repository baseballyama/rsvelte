<script>
	import Comp from './01-basic.svelte';
	let a = 1;
</script>

<Comp>
	{@debug a}
	<svelte:fragment slot="footer">{@debug a}</svelte:fragment>
</Comp>
