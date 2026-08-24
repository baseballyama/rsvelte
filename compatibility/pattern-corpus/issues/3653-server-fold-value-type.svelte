<script>
	// Operand pairs that collide under stringification and differ as JS values.
	const both_numeric_strings = '1' + '1';
	const string_then_number = '1' + 1;
	const number_then_string = 1 + '1';
	const both_numbers = 1 + 1;
	const not_numeric = 'a' + 1;
	const with_boolean = '1' + true;
	const with_null = '1' + null;
	const with_undefined = '1' + undefined;
	const empty_string = '' + 0;
	const boolean_first = true + 1;
	const null_first = null + 1;
	const negative = -1 + '1';

	// `*` and `-` coerce, and neither is a concatenation.
	const times = '2' * '3';
	const minus = '3' - '1';
	const minus_nan = 'a' - 1;

	// Precedence: `*` binds tighter, so splitting there first makes it the root.
	const precedence = 1 + 2 * 3;
	const precedence_string = 'x' + 2 * 3;

	// Associativity: `-` is left-associative, so the split is the rightmost one.
	const associativity = 10 - 3 - 2;

	// A folded constant read again is still a value, not its rendered text.
	const alias = both_numeric_strings + both_numeric_strings;
	const alias_number = both_numbers + both_numbers;

	// Floats keep JS's own rendering.
	const float_sum = 0.1 + 0.2;
</script>

<p>{both_numeric_strings}</p>
<p>{string_then_number}</p>
<p>{number_then_string}</p>
<p>{both_numbers}</p>
<p>{not_numeric}</p>
<p>{with_boolean}</p>
<p>{with_null}</p>
<p>{with_undefined}</p>
<p>{empty_string}</p>
<p>{boolean_first}</p>
<p>{null_first}</p>
<p>{negative}</p>
<p>{times}</p>
<p>{minus}</p>
<p>{minus_nan}</p>
<p>{precedence}</p>
<p>{precedence_string}</p>
<p>{associativity}</p>
<p>{alias}</p>
<p>{alias_number}</p>
<p>{float_sum}</p>

<!-- the same expressions written directly: this path was always correct, and is
     the positive control that names the representation rather than an operator -->
<p>{'1' + '1'}</p>
<p>{1 + 2 * 3}</p>
<p>{10 - 3 - 2}</p>
