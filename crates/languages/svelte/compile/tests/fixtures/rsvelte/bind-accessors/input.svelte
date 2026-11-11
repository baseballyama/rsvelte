<script>
	import C from './C.svelte';
	let v = $state(1);
	let rest = {};
</script>
{#snippet s()}<i>{v}</i>{/snippet}
<p>before</p>
<C a={1} bind:value={() => v, (x) => (v = x)} {...rest} bind:other={v} b={2} />
{#if v}
	<span>x</span>
	<C bind:open={() => v, (x) => (v = x)}>child {v}</C>
{/if}
{@render s()}
