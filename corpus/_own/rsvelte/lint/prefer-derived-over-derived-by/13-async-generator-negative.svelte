<script>
	let a = $state(1);
	let v1 = $derived.by(async () => a);
	let v2 = $derived.by(function* () {
		return a;
	});
	let v3 = $derived.by(async function () {
		return a;
	});
</script>

{v1}{v2}{v3}
