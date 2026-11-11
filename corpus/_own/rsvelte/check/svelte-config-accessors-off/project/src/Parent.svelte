<script lang="ts">
	import Child from './Child.svelte';

	let child!: Child;

	function probe(): number {
		return child.value;
	}
</script>

<Child bind:this={child} value="a" />
<span>{probe()}</span>
