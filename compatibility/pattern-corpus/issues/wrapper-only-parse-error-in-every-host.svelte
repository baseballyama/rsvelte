<script lang="ts">
	let accessor: any;
	let declare: any;
	const s = accessor satisfies string;
</script>

<p>{accessor satisfies string}</p>
<p>{declare satisfies string}</p>
<p title={accessor satisfies string}>x</p>
<p onclick={() => accessor satisfies string}>e</p>
{#if accessor satisfies string}y{/if}
{#if 1}{@const c = accessor satisfies string}{c}{/if}
{#each accessor satisfies string[] as z}{z}{/each}
{#key accessor satisfies string}k{/key}
{@html accessor satisfies string}
{#snippet t(q)}{q}{/snippet}
{@render t(declare satisfies string)}
<p>{s}</p>
<p>{accessor as string}</p>
<p>{(accessor, declare)}</p>
