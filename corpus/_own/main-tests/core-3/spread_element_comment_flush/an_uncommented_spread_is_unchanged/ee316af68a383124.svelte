<script>
	let a = [1];
	const b = [...(a.length ? [] : [2])];
</script>
<p>{b.length}</p>
