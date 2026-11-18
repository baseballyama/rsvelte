<script>
	export let a;
	export let b;
</script>

{#if a || b}
	<p>1</p>
{:else if a}
	<p>2</p>
{/if}

{#if a}
	<p>3</p>
{:else if a || b}
	<p>4</p>
{/if}
