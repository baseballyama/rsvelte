<script>
	const obj = { x: 1, y: 2 };
	let { x, y } = obj;
	x = 10;
	let [p, q] = [1, 2];
	q = 20;
	void [x, y, p, q];
</script>
<p>partial reassignment</p>
