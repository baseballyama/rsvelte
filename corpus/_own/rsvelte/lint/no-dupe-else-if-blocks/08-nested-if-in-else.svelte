<script>
	export let a;
	export let b;
</script>

{#if a}
	<p>1</p>
{:else}
	{#if b}
		<p>2</p>
	{/if}
	{#if a}
		<p>3</p>
	{/if}
{/if}
