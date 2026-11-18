<script>
	export let a;
	export let b;
	export let c;
</script>

{#if a && b}
	<p>1</p>
{:else if a && b && c}
	<p>2</p>
{/if}
