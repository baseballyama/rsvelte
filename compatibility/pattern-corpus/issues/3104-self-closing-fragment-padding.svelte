<script>
	import Inner from '../adversarial/legacy/legacy-slots-and-events.svelte';
</script>

<Inner rows={[]}>
	<svelte:fragment slot="header" />
	<svelte:fragment slot="empty"   />
	<svelte:fragment slot="footer"><i>x</i></svelte:fragment>
</Inner>
