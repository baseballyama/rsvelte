<script lang="ts">
	function flip(node: Element, move: string) {
		return { duration: 1 };
	}
	function slide(node: Element, move: string, options: { delay: number }) {
		return { duration: options.delay };
	}
	let items = [1, 2];
</script>

{#each items as item (item)}
	<p animate:flip>{item}</p>
	<p animate:slide={{ delay: 1 }}>{item}</p>
{/each}
