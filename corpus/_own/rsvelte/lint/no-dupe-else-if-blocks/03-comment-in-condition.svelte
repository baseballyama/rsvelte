<script>
	export let foo;
	export let bar;
</script>

{#if foo && bar}
	<p>1</p>
{:else if foo /* note */ && bar}
	<p>2</p>
{/if}
