<script>
	function a(n) { return n; }
	let tag = "div";
</script>

<svelte:body use:a use:a />
<svelte:document use:a use:a />
<svelte:window use:a use:a />
<svelte:element this={tag} use:a use:a>t</svelte:element>
<div use:a={1e3} use:a={1000}>numeric</div>
<div use:a={'s'} use:a={"s"}>quotes</div>
<div use:a={/r/g} use:a={/r/gi}>flags</div>
