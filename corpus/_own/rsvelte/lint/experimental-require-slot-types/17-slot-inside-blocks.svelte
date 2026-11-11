<script lang="ts">
	export let items: number[];
	export let cond: boolean;
</script>
{#if cond}
	{#each items as item}
		<div>
			<slot name="row" {item} />
		</div>
	{/each}
{/if}
