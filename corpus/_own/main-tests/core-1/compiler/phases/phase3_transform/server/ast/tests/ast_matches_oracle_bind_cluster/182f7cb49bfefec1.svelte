<script>
	import Component from './Component.svelte';
	let type = $state(Component)
	let elem = $state()
</script>

<svelte:component bind:this={elem} this={type}>
	Content
</svelte:component>
