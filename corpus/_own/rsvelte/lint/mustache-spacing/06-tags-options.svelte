<script>
	/* eslint svelte/mustache-spacing: ["warn", { "tags": { "openingBrace": "always", "closingBrace": "always-after-expression" } }] */
	let list = [1, 2];
	let c = true;
</script>

{#if c}
	yes
{/if}

{ #each list as x }
	{x}
{ /each}
