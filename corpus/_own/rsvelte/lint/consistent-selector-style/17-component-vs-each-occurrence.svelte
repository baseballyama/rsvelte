<script>
	/* eslint svelte/consistent-selector-style: ["warn", { style: ["id", "class", "type"] }] */
	import Foo from './Foo.svelte';
	let items = [1];
</script>

<Foo><b>a</b></Foo>
{#each items as i (i)}
	<i>{i}</i>
{/each}
{#snippet snip()}
	<u>u</u>
{/snippet}
{#if items.length}
	<s>s</s>
{/if}
{#await Promise.resolve(1) then v}
	<q>{v}</q>
{/await}

<style>
	b {
		color: red;
	}
	i {
		color: red;
	}
	u {
		color: red;
	}
	s {
		color: red;
	}
	q {
		color: red;
	}
</style>
