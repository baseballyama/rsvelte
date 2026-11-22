<script lang="ts">
	import Comp from './Comp.svelte';
	function a(node: Element, p: number) {}
</script>

<Comp use:a={'s'}>x</Comp>
