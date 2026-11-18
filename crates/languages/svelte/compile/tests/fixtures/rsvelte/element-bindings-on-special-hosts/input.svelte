<script>
	let w = $state(0);
	let item = $state({ w: 0 });
	let tag = $state("div");
	let h = $state("");
</script>
<svelte:body bind:clientWidth={w} bind:offsetHeight={item.w} bind:contentRect={w} bind:focused={w} bind:this={w} />
<svelte:element this={tag} bind:clientWidth={w} bind:focused={w}>x</svelte:element>
<svelte:element this={tag} contenteditable="true" bind:innerHTML={h}>y</svelte:element>
<p>{w}{h}{item.w}</p>
