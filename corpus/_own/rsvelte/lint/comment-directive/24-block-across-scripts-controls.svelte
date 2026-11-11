<script module>
	const m = 1;
	export { m };
</script>
<!-- eslint-disable svelte/html-quotes -->
<div id=a>t</div>
<script>
	let i = 1;
</script>
<div id=b>{i}{m}</div>
<!-- eslint-enable svelte/html-quotes -->
<div id=c>t</div>
