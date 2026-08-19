<script>
	export let a;
	export let b;
</script>

{#if a}
	<p>1</p>
{:else}
	<p>text sibling</p>
	{#if a}
		<p>2</p>
	{/if}
	{#if b}
		<p>3</p>
	{/if}
{/if}
