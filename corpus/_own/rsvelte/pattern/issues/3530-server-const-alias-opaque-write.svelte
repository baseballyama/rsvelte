<script>
	let shifted = 8;
	shifted <<= 2;

	let bumped = 1;

	function bump() {
		bumped = 9;
	}

	bump();

	const fromShift = shifted;
	const fromCall = bumped;
</script>

<p>{fromShift}{fromCall}</p>
