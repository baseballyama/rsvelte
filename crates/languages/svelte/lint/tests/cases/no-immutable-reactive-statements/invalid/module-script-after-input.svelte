<script>
	let mutable = 'hello';
	const immutable = 'hello';
	$: console.log(immutable);
	$: console.log(mutable);
</script>

<script module>
	$: b = 1;
</script>

<input bind:value={mutable} />
