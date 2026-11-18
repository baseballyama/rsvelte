<script>
	let x = 'a';
</script>

{#if x === "{ :else }"}
	first
{:else }
	second
{/if}
