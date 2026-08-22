<script>
	let written = 1;
	written += 2;

	const unwritten = 4;

	const alias = written;
	const chained = alias;
	const arithmetic = written + 10;

	const foldable = unwritten;
	const foldableArithmetic = unwritten + 10;
</script>

<p>{alias}{chained}{arithmetic}{foldable}{foldableArithmetic}</p>
