<script lang="ts">
	import Comp from './Comp.svelte';
	let o = $state({ x: 1 });
	let obj = $state({});
</script>
<Comp bind:value={o.x as number} />