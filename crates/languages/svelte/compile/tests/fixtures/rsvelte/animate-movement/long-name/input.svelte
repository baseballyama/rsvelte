<script lang="ts">
	function ff(node: Element, p: { d: number }) { return {}; }
</script>
{#each [1] as x (x)}<div animate:ff></div>{/each}
