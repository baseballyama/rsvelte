<script lang="ts">
	import Comp from './Comp.svelte';
	let o = $state({ x: 1 });
	let obj = $state({});
</script>
<Comp bind:this={o.x as number} />