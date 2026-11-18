<script>
	let title = 't';
	let id = 'i';
	let src = 's';
	let other = 'o';
	let value = 'v';
	let Comp = null;
</script>

<div title={title} id="{id}">a</div>
<img {src} src2={src} alt="x" />
<div title={other}>b</div>
<svelte:component this={Comp} value={value} />
