<script>
	let tag = 'div';
	function f() {}
</script>

<svelte:element this={tag} onclick={f}>x</svelte:element>
<svelte:element this={tag} accesskey="z">x</svelte:element>
<svelte:element this={tag} autofocus tabindex="5">x</svelte:element>
<svelte:element this={tag} aria-labeledby="x">x</svelte:element>
<svelte:element this={tag} aria-hidden="yes">x</svelte:element>
<svelte:element this={tag} role="widget">x</svelte:element>
<svelte:element this={tag} role="link" aria-checked="true">x</svelte:element>
<svelte:element this={tag} onmouseover={f}>x</svelte:element>
