<script lang="ts">
	function f(node: Element, p: { d: number }) { return {}; }
</script>
{#each [1] as x (x)}<div animate:f|local
></div>{/each}
