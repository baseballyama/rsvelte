<script>
	let b;
	$: var a = 'declared';
	$: ((b = 'sequenced'), 1);
	void a;
</script>

{a}{b}
