<script lang="ts">
	import Card from './17-slot-inside-blocks.svelte';
	export let title: string;
</script>
<Card items={[]} cond={true}>
	<svelte:fragment slot="row">{title}</svelte:fragment>
</Card>
