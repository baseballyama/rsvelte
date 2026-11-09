<script lang="ts">
	let a = $state(1);
</script>

{#if a}
	{const x = $derived(a as number)}
	{const y = $derived($derived(a) as number)}
	{const z = $derived(a)}
	{x}{y}{z}
{/if}
