<script lang="ts">
	let { xs, p }: { xs: number[]; p: Promise<number[]> } = $props();
</script>

{#each xs as x, i}
	{@const label = ((v: number) => `${v}`)(x)}
	<span>{label}{i}</span>
{/each}

{#await p then values}
	{#each values as v}<span>{((n: number) => n + 1)(v)}</span>{/each}
{/await}
