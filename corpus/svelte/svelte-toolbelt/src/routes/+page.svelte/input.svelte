<script lang="ts">
	import { box } from "$lib/box/box.svelte";
	import { attachRef } from "$lib/utils/attach-ref.js";

	const ref = box<Element | null>(null);
	const props = { ...attachRef(ref) };

	$effect(() => {
		console.log(ref.current);
	});

	let show = $state(false);
</script>

<button onclick={() => (show = !show)}>Toggle</button>

{#if show}
	<div {...props}>Hello world</div>
{/if}
