<script>
	export let a;
	export let b;
	export let c;
</script>

{#if a && b && c}
	<p>1</p>
{:else if c && b && a}
	<p>2</p>
{/if}
