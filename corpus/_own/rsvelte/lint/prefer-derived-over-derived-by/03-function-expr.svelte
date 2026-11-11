<script>
	let a = $state(1);
	let v = $derived.by(function () {
		return a;
	});
</script>

{v}
