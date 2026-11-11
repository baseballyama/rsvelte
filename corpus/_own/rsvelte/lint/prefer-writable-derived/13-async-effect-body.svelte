<script>
	let src = $state(0);
	let a = $state(0);
	let b = $state(0);
	$effect(async () => {
		a = src + 1;
	});
	$effect.pre(async function () {
		b = src - 1;
	});
</script>

{a}{b}
