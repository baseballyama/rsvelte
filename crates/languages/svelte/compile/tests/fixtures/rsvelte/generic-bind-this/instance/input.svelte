<script lang="ts">
	import Component from './component.svelte';

	let bound = $state<Component<'x'>>();
	bound?.open('y');
</script>

<Component bind:this={bound} value="x" />
