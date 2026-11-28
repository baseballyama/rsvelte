<script>
	let { a, b } = $props();
</script>

{#if a}
	A
{:elseif b}
	B
{/if}
