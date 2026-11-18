<script>
	let tag = 'div';
	function f() {}
</script>

<svelte:element this={tag} scope="col" tabindex="0">x</svelte:element>
<svelte:element this={tag} aria-activedescendant="x">x</svelte:element>
<svelte:element this={tag} onclick={f}>x</svelte:element>
<svelte:element this={tag} role="checkbox">x</svelte:element>
<svelte:element this={tag}>
	<input autofocus />
	<figcaption>x</figcaption>
</svelte:element>
<button><svelte:element this={tag} /></button>
<button><svelte:element this={tag}>x</svelte:element></button>
