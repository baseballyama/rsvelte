<script lang="ts">
	import Component from './component.svelte';
	let component: ReturnType<typeof Component> | undefined = $state();
	const named: string = component!.api();
</script>

<Component n="no" bind:this={component} />
