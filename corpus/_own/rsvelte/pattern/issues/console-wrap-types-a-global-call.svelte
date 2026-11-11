<script>
	let base = $state(1);
	let d = $derived(base);

	function logs() {
		const random = Math.random();
		const floored = Math.floor(base);
		const numbered = Number(base);
		const stringed = String(base);
		const big = BigInt(1);
		const charred = String.fromCharCode(base);
		const checked = Number.isInteger(base);
		const pi = Math.PI;

		console.log(random, floored, numbered, stringed);
		console.log(big, charred, checked, pi);
		console.log(Math.random());
		console.log(Math.PI);
	}

	function shadow() {
		const Math = { random: () => 1, PI: 1 };
		const rolled = Math.random();
		const circle = Math.PI;

		console.log(rolled, circle);
		return [rolled, circle];
	}

	function unknowns() {
		const missing = Math.notAThing(base);
		const other = JSON.stringify(base);
		const shadowed = shadow();

		console.log(missing);
		console.log(other);
		console.log(shadowed);
		console.log(Math.notAThing(1));
		console.log(Math.notAThing);
		console.log(d);
	}
</script>

<button onclick={logs}></button>
<button onclick={unknowns}></button>
{d}
