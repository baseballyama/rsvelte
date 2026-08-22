<script>
	export let a;
	export let b;
</script>

{#if a && b}
	<p>1</p>
{:else if a  &&
	b}
	<p>2</p>
{/if}
