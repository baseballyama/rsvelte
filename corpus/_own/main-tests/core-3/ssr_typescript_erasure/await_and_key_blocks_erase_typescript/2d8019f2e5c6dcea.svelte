<script lang="ts">
	let { p, k }: { p: Promise<string>; k: number } = $props();
</script>

{#await p}
	<span>loading</span>
{:then value}
	<span>{(value as string).length}</span>
{:catch e}
	<span>{(e as Error).message}</span>
{/await}

{#key k}<span>{(k as number).toFixed(2)}</span>{/key}
