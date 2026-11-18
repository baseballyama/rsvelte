<script>
	let mutable = 'x';
	const aliased = mutable;
</script>

<slot name={mutable} />
<slot name={aliased} />
