<script>
	export let a;
</script>

{#if a}
	<p>1</p>
{:else if a}
	<p>2</p>
{:else if a}
	<p>3</p>
{/if}
