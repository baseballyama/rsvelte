<script>
	let w = $state(0);
	let h = $state('');
	let el = $state();
	let scrollY = $state(0);
</script>

<svelte:window bind:innerWidth={w} bind:scrollY />
<svelte:body bind:clientWidth={w} />
<svelte:document bind:activeElement={el} />
<svelte:element this={'div'} bind:this={el}>t</svelte:element>
<svelte:element this={'div'} contenteditable="true" bind:innerHTML={h}></svelte:element>
<p contenteditable="true" bind:innerHTML={h}></p>
