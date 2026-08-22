<script>
	let n = $state(0);
	const obj = { a: 1 };
	const arr = [1];
	const { destructured } = { destructured: 2 };
	const [element] = [3];
	const { withDefault = 4 } = {};
</script>

<p>{obj}{arr}{destructured}{element}{withDefault}{n}</p>
