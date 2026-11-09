<script lang="ts">
	let a = $state(1);
</script>

{#if a}
	{@const x = a as number}
	{@const y = $derived(a) as number}
	{@const z = $derived(a)}
	{x}{y}{z}
{/if}
