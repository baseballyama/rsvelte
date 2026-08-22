<script>
	let a, b;
	$: a = b = 'shared';
	$: b = 'direct';
</script>

{a}{b}
