<script>
	import C from './C.svelte';
	let x = $state(1);
	let { D } = $props();
	const a = (n) => {};
</script>
<C {@attach a} />
<C a={1} {@attach (n) => console.log(n, x)} b={x} {@attach a} />
<D {@attach a}>child</D>
<svelte:component this={D} {@attach a} />
{#if x}<C {...{ y: 1 }} {@attach a} />{/if}
<button onclick={() => x++}>+</button>
<C {@attach x > 1 ? a : null} {@attach (n) => a(n, x)} />
