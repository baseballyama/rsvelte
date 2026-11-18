<script context="module">
	export const shared = { hits: 0 };
</script>

<script>
	import { beforeUpdate, afterUpdate, onDestroy } from 'svelte';

	export let a = 1;
	let b = 2;

	$: doubled = a * 2;
	$: if (doubled > 2) b = doubled;

	beforeUpdate(() => {
		shared.hits += 1;
	});
	afterUpdate(() => {});
	onDestroy(() => {});
</script>

<div {...$$restProps} data-a={$$props.a}>
	{#if $$slots.header}
		<slot name="header" />
	{/if}
	<slot {a} {b} />
	{#if $$slots.footer}<slot name="footer" />{/if}
</div>
<p>{doubled}{shared.hits}</p>
