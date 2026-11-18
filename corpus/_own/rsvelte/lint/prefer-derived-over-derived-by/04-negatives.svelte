<script>
	let a = $state(1);
	function calc() {
		return a;
	}
	let v1 = $derived.by(calc);
	let v2 = $derived.by(() => {
		const t = a * 2;
		return t;
	});
	let v3 = $derived.by(() => {
		return;
	});
</script>

{v1}{v2}{v3}
