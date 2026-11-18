<script>
	// `Number(x)` is ToNumber, which a bigint HAS — unlike the arithmetic
	// operators, which throw on one.
	const from_bigint = Number(1n);
	const negative = Number(-2n);
	const zero = Number(0n);
	const composed = Number(1n) + 1;
	const stringified = String(1n) + 'x';

	// Controls that must NOT widen with it.
	const not_an_integer = Number.isInteger(1n);
	const is_an_integer = Number.isInteger(3);
	const stays_a_bigint = BigInt(3);
</script>

<p>{from_bigint}</p>
<p>{negative}</p>
<p>{zero}</p>
<p>{composed}</p>
<p>{stringified}</p>
<p>{not_an_integer}</p>
<p>{is_an_integer}</p>
<p>{stays_a_bigint}</p>

<p>{Number(1n)}</p>
<p>{String(1n)}</p>
<p>{Number.isInteger(1n)}</p>
