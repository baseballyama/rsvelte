<script>
	let s, t;
	$: s = `plain text with no expressions`;
	$: t = String.raw`raw`;
</script>

{s}{t}
