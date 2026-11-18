<script lang="ts">
	let n: number = 'x';
	let { label }: { label: string } = $props();
	let count = $state(0);
	let maybe: string | undefined = $state();
</script>

<button type="button" onclick={() => count.toUpperCase()}>{label.foo}</button>
{#if maybe}
	<p>{maybe.length}</p>
{:else}
	<p>{maybe.length}</p>
{/if}
<p title="a{count.bar}b">😀 {label.baz}</p>
