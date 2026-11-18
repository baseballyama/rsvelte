<script>
	let base = $state(1);
	let d = $derived(base);

	function logs() {
		let plain = 1;
		var hoisted = 'x';
		const fixed = 2;
		let reassigned = 1;
		let updated = 1;
		let uninitialised;

		reassigned = base;
		updated++;

		console.log(plain);
		console.log(hoisted);
		console.log(fixed);
		console.log(reassigned);
		console.log(updated);
		console.log(uninitialised);
		console.log(d);
	}
</script>

<button onclick={logs}></button>
{d}
