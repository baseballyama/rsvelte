<script>
	let handler = () => {};
	let active = true;
	let tag = 'div';
</script>

<button on:click|once={handler}
	class:active>directive first attribute, beside on multiline</button>

<svelte:window on:resize={handler} />

<div title="<span id=fake>"
	data-x="{'}'}">decoy markup inside attribute values</div>

<svelte:element this={tag} on:click={handler}
	id="z">this beside, directive beside, id below</svelte:element>
