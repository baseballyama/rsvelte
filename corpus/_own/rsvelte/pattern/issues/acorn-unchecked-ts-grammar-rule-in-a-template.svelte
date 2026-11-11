<script lang="ts">
	let a: any;
</script>

<p>{<string>() => a}</p>
<p title={<string>() => a}>x</p>
<button onclick={<string>() => a}>y</button>
{#if 1}{@const c = <string>() => a}{c}{/if}
{#each [<string>() => a] as z}{z}{/each}
{#snippet s(q)}{q}{/snippet}
{@render s(<string>() => 1)}
<p>{(<T,>(t: T) => t)(1)}</p>
