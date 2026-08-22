<script module>
	export const shared = $state({ n: 1 });
</script>

<script>
	export let flag = true;
</script>

{#if flag}
	{@const seen = shared.n}
	<span>{seen}</span>
{/if}
