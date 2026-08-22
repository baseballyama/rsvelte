<script>
	let tag = 'div';
</script>

<svelte:element this={tag}
	class="x">oracle sees `this` as first attribute, beside</svelte:element>

<svelte:element
	this={tag}
	class="x">both agree: first attribute below</svelte:element>
