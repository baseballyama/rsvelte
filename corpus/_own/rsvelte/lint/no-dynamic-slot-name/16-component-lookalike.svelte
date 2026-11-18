<script>
	import Slot from './01-basic.svelte';
	let d = 'x';
</script>

<Slot name={d} />
<svelte:fragment slot={d}>frag</svelte:fragment>
<div slot={d}>plain</div>
