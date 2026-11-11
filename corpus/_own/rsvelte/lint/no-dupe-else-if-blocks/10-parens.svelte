<script>
	export let a;
	export let b;
</script>

{#if (a)}
	<p>1</p>
{:else if a}
	<p>2</p>
{/if}

{#if a && b}
	<p>3</p>
{:else if (b) && (a)}
	<p>4</p>
{/if}
