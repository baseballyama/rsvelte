<script>
	let n = 1;
	function f(x) {
		console.log(x);
	}

	// The label is `$`; the `:` need not be glued to it, and svelte2tsx wraps
	// the statement without rewriting either.
	$ : f(n);
	$  : f(n);
	$	: f(n);
	$/* between */: f(n);
	$ : { f(n); }
	$ : if (n) f(n);

	// Controls: the tight spelling, and the assignment path that is rewritten.
	$: f(n);
	let doubled;
	$ : doubled = n * 2;
</script>

<p>{n}{doubled}</p>
