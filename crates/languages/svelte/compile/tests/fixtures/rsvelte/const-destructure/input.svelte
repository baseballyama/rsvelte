<script>
	let { items } = $props();
	let fallback = $state('n/a');
</script>

{#each items as item}
	{@const { width, height } = item.size}
	{@const [first, second = fallback] = item.tags}
	{@const { label: title, ...extra } = item}
	<p>{width}x{height} {first} {second} {title} {extra.note}</p>
{/each}
